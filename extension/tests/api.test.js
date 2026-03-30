/**
 * Tests for extension/utils/api.js
 * Written BEFORE implementation (TDD RED phase).
 */

const {
  scanEmail,
  registerInstance,
  sendHeartbeat,
  DEFAULT_API_URL,
} = require('../utils/api');

const API_URL = 'http://localhost:5000';
const AUTH_TOKEN = 'test-jwt-token';
const INSTANCE_TOKEN = 'abc123instancetoken';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function mockFetch(status, body) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  });
}

// ---------------------------------------------------------------------------
// DEFAULT_API_URL
// ---------------------------------------------------------------------------

describe('DEFAULT_API_URL', () => {
  it('defaults to localhost:5000', () => {
    expect(DEFAULT_API_URL).toBe('http://localhost:5000');
  });
});

// ---------------------------------------------------------------------------
// scanEmail
// ---------------------------------------------------------------------------

describe('scanEmail', () => {
  it('POSTs to /api/scan with subject and body', async () => {
    mockFetch(201, { success: true, verdict: 'phishing', confidence: 0.9 });

    await scanEmail(API_URL, AUTH_TOKEN, 'Test subject', 'Test body');

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/api/scan`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ subject: 'Test subject', body: 'Test body' }),
      })
    );
  });

  it('includes Authorization Bearer header', async () => {
    mockFetch(201, { success: true });

    await scanEmail(API_URL, AUTH_TOKEN, '', 'body');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe(`Bearer ${AUTH_TOKEN}`);
  });

  it('sets Content-Type to application/json', async () => {
    mockFetch(201, { success: true });

    await scanEmail(API_URL, AUTH_TOKEN, '', 'body');

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Content-Type']).toBe('application/json');
  });

  it('returns parsed JSON on success', async () => {
    const payload = { success: true, verdict: 'legitimate', confidence: 0.95 };
    mockFetch(201, payload);

    const result = await scanEmail(API_URL, AUTH_TOKEN, 'Subject', 'Body');

    expect(result).toEqual(payload);
  });

  it('throws on non-2xx response', async () => {
    mockFetch(503, { success: false, error: 'Service unavailable' });

    await expect(scanEmail(API_URL, AUTH_TOKEN, '', 'body')).rejects.toThrow('503');
  });

  it('throws on 401 unauthorized', async () => {
    mockFetch(401, { success: false, error: 'Unauthorized' });

    await expect(scanEmail(API_URL, AUTH_TOKEN, '', 'body')).rejects.toThrow('401');
  });
});

// ---------------------------------------------------------------------------
// registerInstance
// ---------------------------------------------------------------------------

describe('registerInstance', () => {
  it('POSTs to /api/extension/register', async () => {
    mockFetch(201, { success: true, instance_token: INSTANCE_TOKEN });

    await registerInstance(API_URL, AUTH_TOKEN, { browser: 'Chrome 124', os_name: 'Windows 11' });

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/api/extension/register`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('includes browser and os_name in the body', async () => {
    mockFetch(201, { success: true, instance_token: INSTANCE_TOKEN });

    await registerInstance(API_URL, AUTH_TOKEN, { browser: 'Edge 124', os_name: 'macOS 14' });

    const [, options] = fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.browser).toBe('Edge 124');
    expect(body.os_name).toBe('macOS 14');
  });

  it('includes Authorization header', async () => {
    mockFetch(201, { success: true, instance_token: INSTANCE_TOKEN });

    await registerInstance(API_URL, AUTH_TOKEN, {});

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Authorization']).toBe(`Bearer ${AUTH_TOKEN}`);
  });

  it('returns instance_token on success', async () => {
    mockFetch(201, { success: true, instance_token: INSTANCE_TOKEN });

    const result = await registerInstance(API_URL, AUTH_TOKEN, {});

    expect(result.instance_token).toBe(INSTANCE_TOKEN);
  });

  it('throws on non-2xx response', async () => {
    mockFetch(401, { success: false });

    await expect(registerInstance(API_URL, AUTH_TOKEN, {})).rejects.toThrow('401');
  });
});

// ---------------------------------------------------------------------------
// sendHeartbeat
// ---------------------------------------------------------------------------

describe('sendHeartbeat', () => {
  it('POSTs to /api/extension/heartbeat', async () => {
    mockFetch(200, { success: true });

    await sendHeartbeat(API_URL, INSTANCE_TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      `${API_URL}/api/extension/heartbeat`,
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('sends instance_token in body', async () => {
    mockFetch(200, { success: true });

    await sendHeartbeat(API_URL, INSTANCE_TOKEN);

    const [, options] = fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body.instance_token).toBe(INSTANCE_TOKEN);
  });

  it('does NOT include Authorization header', async () => {
    mockFetch(200, { success: true });

    await sendHeartbeat(API_URL, INSTANCE_TOKEN);

    const [, options] = fetch.mock.calls[0];
    expect(options.headers['Authorization']).toBeUndefined();
  });

  it('returns parsed JSON on success', async () => {
    const payload = { success: true };
    mockFetch(200, payload);

    const result = await sendHeartbeat(API_URL, INSTANCE_TOKEN);

    expect(result).toEqual(payload);
  });

  it('throws on non-2xx response', async () => {
    mockFetch(404, { success: false });

    await expect(sendHeartbeat(API_URL, INSTANCE_TOKEN)).rejects.toThrow('404');
  });
});
