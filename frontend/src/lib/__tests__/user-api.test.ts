import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getUserStats, getUserRounds } from '../user-api'

// ---------------------------------------------------------------------------
// Stub global fetch before each test
// ---------------------------------------------------------------------------

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
// getUserStats
// ---------------------------------------------------------------------------

describe('getUserStats', () => {
  it('maps snake_case backend response to camelCase UserStats', async () => {
    mockFetch({
      success: true,
      data: {
        total_emails_scanned: 42,
        threats_detected: 7,
        active_agents: 2,
        total_api_cost: 0.05,
      },
    })

    const stats = await getUserStats('test-token')
    expect(stats.totalEmailsScanned).toBe(42)
    expect(stats.phishingDetected).toBe(7)
    // Static defaults
    expect(stats.markedSafe).toBe(0)
    expect(stats.creditsRemaining).toBe(1000)
  })

  it('falls back to zeros when fields are missing', async () => {
    mockFetch({ success: true, data: {} })

    const stats = await getUserStats('test-token')
    expect(stats.totalEmailsScanned).toBe(0)
    expect(stats.phishingDetected).toBe(0)
  })

  it('also accepts a flat response (no "data" wrapper)', async () => {
    mockFetch({
      total_emails_scanned: 10,
      threats_detected: 3,
    })

    const stats = await getUserStats('test-token')
    expect(stats.totalEmailsScanned).toBe(10)
    expect(stats.phishingDetected).toBe(3)
  })

  it('sends the Authorization header', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await getUserStats('my-secret-token')

    expect(fetchMock).toHaveBeenCalledOnce()
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect((init.headers as Record<string, string>)['Authorization']).toBe(
      'Bearer my-secret-token'
    )
  })

  it('throws when response is not ok', async () => {
    mockFetch({ error: 'Unauthorized' }, false, 401)
    await expect(getUserStats('bad-token')).rejects.toThrow('Failed to fetch stats')
  })
})

// ---------------------------------------------------------------------------
// getUserRounds
// ---------------------------------------------------------------------------

describe('getUserRounds', () => {
  it('returns the items array from a paginated response', async () => {
    const fakeItems = [
      { id: 1, status: 'completed', total_emails: 5 },
      { id: 2, status: 'running', total_emails: 3 },
    ]
    mockFetch({ success: true, items: fakeItems })

    const rounds = await getUserRounds('test-token')
    expect(rounds).toHaveLength(2)
    expect(rounds[0].id).toBe(1)
  })

  it('falls back to "data" key when "items" is absent', async () => {
    const fakeItems = [{ id: 3, status: 'completed', total_emails: 2 }]
    mockFetch({ success: true, data: fakeItems })

    const rounds = await getUserRounds('test-token')
    expect(rounds[0].id).toBe(3)
  })

  it('returns empty array when neither key exists', async () => {
    mockFetch({ success: true })

    const rounds = await getUserRounds('test-token')
    expect(rounds).toEqual([])
  })

  it('throws when response is not ok', async () => {
    mockFetch({ error: 'Server error' }, false, 500)
    await expect(getUserRounds('test-token')).rejects.toThrow('Failed to fetch rounds')
  })
})
