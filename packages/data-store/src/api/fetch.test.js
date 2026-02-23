import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import doFetch from './fetch';

describe('data-store fetch error enrichment', () => {
  let originalFetch;
  let originalWindow;
  let originalDocument;

  beforeEach(() => {
    originalFetch = global.fetch;
    originalWindow = global.window;
    originalDocument = global.document;

    global.window = {
      CustomEvent: function CustomEvent(type, init) {
        return { type, detail: init?.detail };
      },
      crypto: {
        randomUUID: () => 'client-id-123',
      },
    };
    global.document = {
      dispatchEvent: vi.fn(),
    };
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.window = originalWindow;
    global.document = originalDocument;
    vi.restoreAllMocks();
  });

  test('attaches requestId/status for HTTP errors', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      headers: { get: (key) => (key === 'x-request-id' ? 'req-abc' : null) },
      text: async () => JSON.stringify({ message: 'Validation failed' }),
    });

    const api = { apiUrl: 'https://api.example.com' };
    await expect(
      doFetch.call(api, '/api/project/1/comment', { method: 'POST' })
    ).rejects.toMatchObject({
      message: 'Validation failed',
      failureType: 'http_error',
      status: 422,
      requestId: 'req-abc',
      referenceId: 'req-abc',
    });
  });

  test('creates client-only reference for network errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    const api = { apiUrl: 'https://api.example.com' };
    await expect(
      doFetch.call(api, '/api/project/1/comment', { method: 'POST' })
    ).rejects.toMatchObject({
      message: 'Failed to fetch',
      failureType: 'network_error',
      requestId: null,
      clientErrorId: 'client-id-123',
      referenceId: 'client-id-123',
    });
  });

  test('throws invalid_json when success response body is not JSON', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: (key) => (key === 'x-request-id' ? 'req-json' : null) },
      json: async () => {
        throw new Error('Unexpected token < in JSON');
      },
    });

    const api = { apiUrl: 'https://api.example.com' };
    await expect(
      doFetch.call(api, '/api/project/1/resource', { method: 'POST' })
    ).rejects.toMatchObject({
      message: 'Invalid JSON response',
      failureType: 'invalid_json',
      requestId: 'req-json',
      referenceId: 'req-json',
    });
  });
});
