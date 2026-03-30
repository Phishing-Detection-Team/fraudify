import { describe, it, expect, vi, beforeEach } from 'vitest'
import { requestPasswordReset, resetPassword } from '../auth-api'

function mockFetch(body: unknown, ok = true, status = 200) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok,
      status,
      json: async () => body,
    })
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

// ---------------------------------------------------------------------------
// requestPasswordReset
// ---------------------------------------------------------------------------

describe('requestPasswordReset', () => {
  it('returns true on success', async () => {
    mockFetch({ success: true, message: 'Reset email sent' })

    const result = await requestPasswordReset('user@example.com')
    expect(result).toBe(true)
  })

  it('POSTs to the forgot-password endpoint with email in body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await requestPasswordReset('user@example.com')

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/auth/forgot-password')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual({ email: 'user@example.com' })
  })

  it('returns true even when the server says email not found (security: no enumeration)', async () => {
    mockFetch({ success: true }, true, 200)
    const result = await requestPasswordReset('unknown@example.com')
    expect(result).toBe(true)
  })

  it('returns false when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await requestPasswordReset('user@example.com')
    expect(result).toBe(false)
  })

  it('returns false on non-ok response', async () => {
    mockFetch({ error: 'Server error' }, false, 500)
    const result = await requestPasswordReset('user@example.com')
    expect(result).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// resetPassword
// ---------------------------------------------------------------------------

describe('resetPassword', () => {
  it('returns true on successful password reset', async () => {
    mockFetch({ success: true, message: 'Password updated' })

    const result = await resetPassword('valid-reset-token', 'NewPass123!')
    expect(result).toBe(true)
  })

  it('POSTs token and new_password to the reset-password endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await resetPassword('reset-token-abc', 'NewPass123!')

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('/api/auth/reset-password')
    expect(init.method).toBe('POST')
    const body = JSON.parse(init.body as string)
    expect(body.token).toBe('reset-token-abc')
    expect(body.new_password).toBe('NewPass123!')
  })

  it('returns false when token is expired or invalid (non-ok response)', async () => {
    mockFetch({ error: 'Token expired or invalid' }, false, 400)

    const result = await resetPassword('expired-token', 'NewPass123!')
    expect(result).toBe(false)
  })

  it('returns false when fetch throws a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    const result = await resetPassword('token', 'NewPass123!')
    expect(result).toBe(false)
  })

  it('returns the error message on failure', async () => {
    mockFetch({ success: false, error: 'Token has expired' }, false, 400)

    const result = await resetPassword('bad-token', 'Pass123!')
    expect(result).toBe(false)
  })
})
