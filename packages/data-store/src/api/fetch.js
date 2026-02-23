function makeLocalErrorId() {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildEnrichedError({
  message,
  failureType,
  status,
  requestId,
  clientErrorId,
  url,
  method,
  responseBody,
}) {
  const error = new Error(message);
  error.name = 'OpenStadRequestError';
  error.failureType = failureType;
  error.status = status || null;
  error.requestId = requestId || null;
  error.clientErrorId = clientErrorId || null;
  error.url = url;
  error.method = method;
  error.responseBody = responseBody || null;
  error.referenceId = requestId || clientErrorId || null;
  return error;
}

export default async function doFetch(url = '', options = {}) {
  let self = this;
  let json;

  if (!options.suspense) {
    const method = (options.method || 'GET').toUpperCase();
    const requestId = makeLocalErrorId();
    const fullUrl = this.apiUrl + url;

    options.headers = options.headers || {};
    options.headers['Content-Type'] =
      options.headers['Content-Type'] || 'application/json';
    options.headers['X-Request-Id'] =
      options.headers['X-Request-Id'] || requestId;

    if (self.currentUserJWT) {
      options.headers['Authorization'] = 'Bearer ' + self.currentUserJWT;
    }

    let response;
    try {
      response = await fetch(fullUrl, options);
    } catch (networkError) {
      const error = buildEnrichedError({
        message: networkError?.message || 'Network request failed',
        failureType: 'network_error',
        status: null,
        requestId: null,
        clientErrorId: requestId,
        url,
        method,
        responseBody: null,
      });
      let event = new window.CustomEvent('osc-error', { detail: error });
      document.dispatchEvent(event);
      throw error;
    }

    const responseRequestId = response.headers.get('x-request-id') || requestId;

    if (!response.ok) {
      let bodyText = await response.text();
      let body;
      try {
        body = bodyText ? JSON.parse(bodyText) : {};
      } catch (parseError) {
        body = {};
      }

      let error = buildEnrichedError({
        message:
          body.error || body.message || response.statusText || 'Request failed',
        failureType: 'http_error',
        status: response.status,
        requestId: responseRequestId,
        clientErrorId: requestId,
        url,
        method,
        responseBody: bodyText || null,
      });
      let event = new window.CustomEvent('osc-error', { detail: error });
      document.dispatchEvent(event);
      throw error;
    }

    try {
      json = await response.json();
    } catch (parseError) {
      const error = buildEnrichedError({
        message: 'Invalid JSON response',
        failureType: 'invalid_json',
        status: response.status,
        requestId: responseRequestId,
        clientErrorId: requestId,
        url,
        method,
        responseBody: null,
      });
      let event = new window.CustomEvent('osc-error', { detail: error });
      document.dispatchEvent(event);
      throw error;
    }

    return json || {};
  }

  return undefined;
}
