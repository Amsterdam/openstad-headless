import { describe, expect, test, vi } from 'vitest';

const requestIdMiddleware = require('./request-id');

describe('request-id middleware', () => {
  test('uses incoming X-Request-Id when present', () => {
    const req = { headers: { 'x-request-id': 'external-id-123' } };
    const res = { setHeader: vi.fn() };
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(req.requestId).toBe('external-id-123');
    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Request-Id',
      'external-id-123'
    );
    expect(next).toHaveBeenCalled();
  });

  test('generates and sets a request id when missing', () => {
    const req = { headers: {} };
    const res = { setHeader: vi.fn() };
    const next = vi.fn();

    requestIdMiddleware(req, res, next);

    expect(typeof req.requestId).toBe('string');
    expect(req.requestId.length).toBeGreaterThan(0);
    expect(res.setHeader).toHaveBeenCalledWith('X-Request-Id', req.requestId);
    expect(next).toHaveBeenCalled();
  });
});
