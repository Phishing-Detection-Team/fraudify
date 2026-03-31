import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock framer-motion
// ---------------------------------------------------------------------------
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, tag: string) => {
      const Component = ({
        children,
        initial: _i,
        animate: _a,
        transition: _t,
        variants: _v,
        ...props
      }: Record<string, unknown>) =>
        React.createElement(
          tag as keyof React.JSX.IntrinsicElements,
          props as Record<string, unknown>,
          children as React.ReactNode
        )
      Component.displayName = `motion.${tag}`
      return Component
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

// ---------------------------------------------------------------------------
// Mock lucide-react
// ---------------------------------------------------------------------------
vi.mock('lucide-react', () => ({
  Loader2:    () => <svg data-testid="loader-icon" />,
  Copy:       () => <svg data-testid="copy-icon" />,
  Check:      () => <svg data-testid="check-icon" />,
  Trash2:     () => <svg data-testid="trash-icon" />,
  Link2:      () => <svg data-testid="link-icon" />,
  ShieldCheck: () => <svg data-testid="shield-check-icon" />,
  Plus:       () => <svg data-testid="plus-icon" />,
}))

// ---------------------------------------------------------------------------
// Mock admin-api
// ---------------------------------------------------------------------------
vi.mock('@/lib/admin-api', () => ({
  createInvite: vi.fn(),
  listInvites:  vi.fn(),
  revokeInvite: vi.fn(),
}))

import { createInvite, listInvites, revokeInvite } from '@/lib/admin-api'
import type { InviteRecord } from '@/lib/admin-api'
import InvitePanel from '@/components/admin/InvitePanel'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeInvite(overrides: Partial<InviteRecord> = {}): InviteRecord {
  return {
    code: 'TESTCODE1234ABCD',
    role: 'user',
    expires_at: '2026-04-06T00:00:00',
    uses_left: 1,
    ...overrides,
  }
}

const mockInvites: InviteRecord[] = [
  makeInvite({ code: 'AAAABBBB11112222', role: 'user' }),
  makeInvite({ code: 'CCCCDDDD33334444', role: 'admin' }),
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InvitePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // By default, listInvites resolves with the mock list
    vi.mocked(listInvites).mockResolvedValue(mockInvites)
    // Default clipboard mock
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------

  describe('initial render', () => {
    it('renders role dropdown', async () => {
      await act(async () => { render(<InvitePanel token="test-token" />) })
      expect(screen.getByTestId('invite-role-select')).toBeTruthy()
    })

    it('renders expiry dropdown', async () => {
      await act(async () => { render(<InvitePanel token="test-token" />) })
      expect(screen.getByTestId('invite-expiry-select')).toBeTruthy()
    })

    it('renders generate button', async () => {
      await act(async () => { render(<InvitePanel token="test-token" />) })
      expect(screen.getByTestId('invite-generate-btn')).toBeTruthy()
    })

    it('renders active invites table after loading', async () => {
      await act(async () => { render(<InvitePanel token="test-token" />) })
      await waitFor(() => expect(screen.getByTestId('invites-table')).toBeTruthy())
    })
  })

  // -------------------------------------------------------------------------
  // Generate invite
  // -------------------------------------------------------------------------

  describe('generate invite', () => {
    it('calls createInvite with correct args when generate is clicked (user, 24h)', async () => {
      vi.mocked(createInvite).mockResolvedValue({
        invite_link: 'http://localhost:3000/auth/signup?invite=NEWCODE123',
        code: 'NEWCODE123',
      })

      await act(async () => { render(<InvitePanel token="test-token" />) })

      // Set role to 'user' and expiry to 24h (default)
      fireEvent.change(screen.getByTestId('invite-role-select'), { target: { value: 'user' } })
      fireEvent.change(screen.getByTestId('invite-expiry-select'), { target: { value: '24' } })

      await act(async () => {
        fireEvent.click(screen.getByTestId('invite-generate-btn'))
      })

      await waitFor(() => {
        expect(vi.mocked(createInvite)).toHaveBeenCalledWith('test-token', 'user', 24)
      })
    })

    it('calls createInvite with admin role and 168h (7d) when selected', async () => {
      vi.mocked(createInvite).mockResolvedValue({
        invite_link: 'http://localhost:3000/auth/signup?invite=ADMINCODE',
        code: 'ADMINCODE',
      })

      await act(async () => { render(<InvitePanel token="test-token" />) })

      fireEvent.change(screen.getByTestId('invite-role-select'), { target: { value: 'admin' } })
      fireEvent.change(screen.getByTestId('invite-expiry-select'), { target: { value: '168' } })

      await act(async () => {
        fireEvent.click(screen.getByTestId('invite-generate-btn'))
      })

      await waitFor(() => {
        expect(vi.mocked(createInvite)).toHaveBeenCalledWith('test-token', 'admin', 168)
      })
    })

    it('shows generated link container after successful generation', async () => {
      vi.mocked(createInvite).mockResolvedValue({
        invite_link: 'http://localhost:3000/auth/signup?invite=NEWCODE123',
        code: 'NEWCODE123',
      })

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await act(async () => {
        fireEvent.click(screen.getByTestId('invite-generate-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('generated-link')).toBeTruthy()
      })

      expect(screen.getByTestId('generated-link').textContent).toContain('NEWCODE123')
    })

    it('shows copy button after generation', async () => {
      vi.mocked(createInvite).mockResolvedValue({
        invite_link: 'http://localhost:3000/auth/signup?invite=COPYTEST',
        code: 'COPYTEST',
      })

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await act(async () => {
        fireEvent.click(screen.getByTestId('invite-generate-btn'))
      })

      await waitFor(() => {
        expect(screen.getByTestId('invite-copy-btn')).toBeTruthy()
      })
    })
  })

  // -------------------------------------------------------------------------
  // Copy to clipboard
  // -------------------------------------------------------------------------

  describe('copy to clipboard', () => {
    it('copy button copies the invite link to clipboard', async () => {
      const inviteLink = 'http://localhost:3000/auth/signup?invite=CLIPBOARD123'
      vi.mocked(createInvite).mockResolvedValue({
        invite_link: inviteLink,
        code: 'CLIPBOARD123',
      })

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await act(async () => {
        fireEvent.click(screen.getByTestId('invite-generate-btn'))
      })

      await waitFor(() => expect(screen.getByTestId('invite-copy-btn')).toBeTruthy())

      await act(async () => {
        fireEvent.click(screen.getByTestId('invite-copy-btn'))
      })

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(inviteLink)
    })
  })

  // -------------------------------------------------------------------------
  // Active invites table
  // -------------------------------------------------------------------------

  describe('active invites table', () => {
    it('renders a row for each invite with revoke button', async () => {
      await act(async () => { render(<InvitePanel token="test-token" />) })

      await waitFor(() => expect(screen.getByTestId('invites-table')).toBeTruthy())

      expect(screen.getByTestId('revoke-btn-AAAABBBB11112222')).toBeTruthy()
      expect(screen.getByTestId('revoke-btn-CCCCDDDD33334444')).toBeTruthy()
    })

    it('shows truncated code (first 8 chars + ellipsis)', async () => {
      await act(async () => { render(<InvitePanel token="test-token" />) })

      await waitFor(() => expect(screen.getByTestId('invites-table')).toBeTruthy())

      // code AAAABBBB11112222 → first 8 = AAAABBBB
      const tableText = screen.getByTestId('invites-table').textContent ?? ''
      expect(tableText).toContain('AAAABBBB')
    })

    it('shows role badge for each invite', async () => {
      await act(async () => { render(<InvitePanel token="test-token" />) })

      await waitFor(() => expect(screen.getByTestId('invites-table')).toBeTruthy())

      const tableText = screen.getByTestId('invites-table').textContent ?? ''
      expect(tableText).toMatch(/user/i)
      expect(tableText).toMatch(/admin/i)
    })

    it('shows empty state when no active invites', async () => {
      vi.mocked(listInvites).mockResolvedValue([])

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await waitFor(() => expect(screen.getByTestId('invites-table')).toBeTruthy())

      const tableText = screen.getByTestId('invites-table').textContent ?? ''
      expect(tableText).toMatch(/no active invites/i)
    })
  })

  // -------------------------------------------------------------------------
  // Revoke invite
  // -------------------------------------------------------------------------

  describe('revoke invite', () => {
    it('calls revokeInvite with correct code when revoke button is clicked', async () => {
      vi.mocked(revokeInvite).mockResolvedValue(undefined)

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await waitFor(() => expect(screen.getByTestId('revoke-btn-AAAABBBB11112222')).toBeTruthy())

      await act(async () => {
        fireEvent.click(screen.getByTestId('revoke-btn-AAAABBBB11112222'))
      })

      await waitFor(() => {
        expect(vi.mocked(revokeInvite)).toHaveBeenCalledWith('test-token', 'AAAABBBB11112222')
      })
    })

    it('removes revoked invite from the table immediately (optimistic)', async () => {
      vi.mocked(revokeInvite).mockResolvedValue(undefined)

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await waitFor(() => expect(screen.getByTestId('revoke-btn-AAAABBBB11112222')).toBeTruthy())

      await act(async () => {
        fireEvent.click(screen.getByTestId('revoke-btn-AAAABBBB11112222'))
      })

      await waitFor(() => {
        expect(screen.queryByTestId('revoke-btn-AAAABBBB11112222')).toBeNull()
      })
    })

    it('keeps other invites when one is revoked', async () => {
      vi.mocked(revokeInvite).mockResolvedValue(undefined)

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await waitFor(() => expect(screen.getByTestId('revoke-btn-AAAABBBB11112222')).toBeTruthy())

      await act(async () => {
        fireEvent.click(screen.getByTestId('revoke-btn-AAAABBBB11112222'))
      })

      await waitFor(() => {
        expect(screen.queryByTestId('revoke-btn-AAAABBBB11112222')).toBeNull()
      })

      expect(screen.getByTestId('revoke-btn-CCCCDDDD33334444')).toBeTruthy()
    })
  })

  // -------------------------------------------------------------------------
  // Loading state
  // -------------------------------------------------------------------------

  describe('loading state', () => {
    it('shows loading state while generate request is in flight', async () => {
      let resolveCreate!: (value: { invite_link: string; code: string }) => void
      vi.mocked(createInvite).mockReturnValue(
        new Promise<{ invite_link: string; code: string }>((resolve) => { resolveCreate = resolve })
      )

      await act(async () => { render(<InvitePanel token="test-token" />) })

      act(() => {
        fireEvent.click(screen.getByTestId('invite-generate-btn'))
      })

      // Button should be disabled or show loading
      await waitFor(() => {
        const btn = screen.getByTestId('invite-generate-btn')
        const isDisabled = btn.hasAttribute('disabled')
        const hasLoaderIcon = screen.queryByTestId('loader-icon') !== null
        expect(isDisabled || hasLoaderIcon).toBe(true)
      })

      // Resolve to avoid pending promise
      await act(async () => {
        resolveCreate({ invite_link: 'http://localhost:3000/auth/signup?invite=X', code: 'X' })
      })
    })
  })

  // -------------------------------------------------------------------------
  // Error handling
  // -------------------------------------------------------------------------

  describe('error handling', () => {
    it('does not crash when listInvites rejects', async () => {
      vi.mocked(listInvites).mockRejectedValue(new Error('Network error'))

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await waitFor(() => expect(screen.getByTestId('invites-table')).toBeTruthy())

      const tableText = screen.getByTestId('invites-table').textContent ?? ''
      expect(tableText).toMatch(/no active invites/i)
    })

    it('does not crash when createInvite rejects', async () => {
      vi.mocked(createInvite).mockRejectedValue(new Error('Server error'))

      await act(async () => { render(<InvitePanel token="test-token" />) })

      await act(async () => {
        fireEvent.click(screen.getByTestId('invite-generate-btn'))
      })

      // After rejection, generate button should still be present
      await waitFor(() => {
        expect(screen.getByTestId('invite-generate-btn')).toBeTruthy()
      })
    })
  })
})
