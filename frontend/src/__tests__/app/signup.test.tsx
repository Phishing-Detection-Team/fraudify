import React, { Suspense } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'

// ---------------------------------------------------------------------------
// Mock next/navigation (useSearchParams)
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
  usePathname: vi.fn(() => '/signup'),
}))

// ---------------------------------------------------------------------------
// Mock next/link
// ---------------------------------------------------------------------------
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

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
        exit: _e,
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
  ShieldAlert:   () => <svg />,
  Database:      () => <svg />,
  Mail:          () => <svg />,
  ArrowRight:    () => <svg />,
  Check:         () => <svg />,
  Eye:           () => <svg />,
  EyeOff:        () => <svg />,
  AlertCircle:   () => <svg />,
}))

// ---------------------------------------------------------------------------
// Mock Logo and modal components
// ---------------------------------------------------------------------------
vi.mock('@/components/Logo', () => ({
  Logo: () => <div data-testid="logo" />,
}))

vi.mock('@/components/PrivacyPolicyModal', () => ({
  PrivacyPolicyModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="privacy-modal" /> : null,
}))

vi.mock('@/components/TermsModal', () => ({
  TermsModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="terms-modal" /> : null,
}))

// ---------------------------------------------------------------------------
// Mock config
// ---------------------------------------------------------------------------
vi.mock('@/lib/config', () => ({
  config: {
    API: {
      BASE_URL: 'http://localhost:5000',
      AUTH: {
        SIGNUP: '/api/auth/signup',
        ADMIN_SIGNUP: '/api/auth/admin/signup',
        AUTH_URL: '/api/auth/url',
      },
    },
    STORAGE_KEYS: {
      PENDING_SIGNUP: 'pending_signup',
    },
  },
}))

import { useSearchParams } from 'next/navigation'
import SignupPage from '@/app/signup/page'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('invite code pre-fill from URL param', () => {
    it('pre-fills invite code input when ?invite= param is present', async () => {
      const mockSearchParams = {
        get: vi.fn((key: string) => (key === 'invite' ? 'TESTINVITECODE' : null)),
      }
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>)

      await act(async () => {
        render(
          <Suspense fallback={null}>
            <SignupPage />
          </Suspense>
        )
      })

      await waitFor(() => {
        const input = screen.queryByTestId('invite-code-input')
        // The invite code input must exist and contain the pre-filled value
        expect(input).toBeTruthy()
        expect((input as HTMLInputElement | null)?.value).toBe('TESTINVITECODE')
      })
    })

    it('invite code input is empty when no ?invite= param', async () => {
      const mockSearchParams = {
        get: vi.fn(() => null),
      }
      vi.mocked(useSearchParams).mockReturnValue(mockSearchParams as unknown as ReturnType<typeof useSearchParams>)

      await act(async () => {
        render(
          <Suspense fallback={null}>
            <SignupPage />
          </Suspense>
        )
      })

      await waitFor(() => {
        const input = screen.queryByTestId('invite-code-input')
        // Either no input rendered or value is empty string
        if (input) {
          expect((input as HTMLInputElement).value).toBe('')
        }
      })
    })
  })
})
