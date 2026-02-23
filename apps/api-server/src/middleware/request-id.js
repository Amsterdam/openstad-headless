const crypto = require('crypto');

function generateRequestId() {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

module.exports = function requestId(req, res, next) {
  const incomingRequestId = req.headers['x-request-id'];
  const requestId =
    typeof incomingRequestId === 'string' && incomingRequestId.trim()
      ? incomingRequestId.trim()
      : generateRequestId();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);
  next();
};
