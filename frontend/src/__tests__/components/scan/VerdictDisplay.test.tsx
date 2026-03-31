import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, tag: string) => {
      const Component = ({ children, initial: _i, animate: _a, transition: _t, variants: _v, ...props }: Record<string, unknown>) =>
        React.createElement(tag as keyof React.JSX.IntrinsicElements, props as Record<string, unknown>, children as React.ReactNode)
      Component.displayName = `motion.${tag}`
      return Component
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAnimation: () => ({ start: vi.fn() }),
}))

vi.mock('lucide-react', () => ({
  Shield: () => <svg data-testid="shield-icon" />,
  ShieldAlert: () => <svg data-testid="shield-alert-icon" />,
  Copy: () => <svg data-testid="copy-icon" />,
}))

import VerdictDisplay from '@/components/scan/VerdictDisplay'

const defaultPhishingProps = {
  verdict: 'phishing' as const,
  confidence: 0.92,
  reasoning: ['Suspicious sender domain', 'Urgency language detected', 'Mismatched URLs'],
  subject: 'Urgent: Verify your account',
}

const defaultSafeProps = {
  verdict: 'safe' as const,
  confidence: 0.87,
  reasoning: ['Known sender', 'No suspicious links'],
  subject: 'Team meeting notes',
}

describe('VerdictDisplay', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
  })

  describe('verdict text rendering', () => {
    it('renders PHISHING verdict text for phishing emails', () => {
      render(<VerdictDisplay {...defaultPhishingProps} />)
      expect(screen.getByText('PHISHING')).toBeTruthy()
    })

    it('renders SAFE verdict text for safe emails', () => {
      render(<VerdictDisplay {...defaultSafeProps} />)
      expect(screen.getByText('SAFE')).toBeTruthy()
    })
  })

  describe('confidence percentage', () => {
    it('renders confidence percentage for phishing verdict', () => {
      render(<VerdictDisplay {...defaultPhishingProps} />)
      const el = screen.getByTestId('confidence-display')
      expect(el.getAttribute('data-confidence')).toBe('92')
    })

    it('renders confidence percentage for safe verdict', () => {
      render(<VerdictDisplay {...defaultSafeProps} />)
      const el = screen.getByTestId('confidence-display')
      expect(el.getAttribute('data-confidence')).toBe('87')
    })

    it('rounds confidence to nearest integer', () => {
      render(<VerdictDisplay {...defaultPhishingProps} confidence={0.925} />)
      const el = screen.getByTestId('confidence-display')
      expect(el.getAttribute('data-confidence')).toBe('93')
    })
  })

  describe('reasoning bullets', () => {
    it('renders all reasoning bullet points', () => {
      render(<VerdictDisplay {...defaultPhishingProps} />)
      expect(screen.getByText('Suspicious sender domain')).toBeTruthy()
      expect(screen.getByText('Urgency language detected')).toBeTruthy()
      expect(screen.getByText('Mismatched URLs')).toBeTruthy()
    })

    it('renders reasoning bullets for safe verdict', () => {
      render(<VerdictDisplay {...defaultSafeProps} />)
      expect(screen.getByText('Known sender')).toBeTruthy()
      expect(screen.getByText('No suspicious links')).toBeTruthy()
    })

    it('renders correct number of bullet list items', () => {
      render(<VerdictDisplay {...defaultPhishingProps} />)
      const items = document.querySelectorAll('li')
      expect(items.length).toBe(3)
    })
  })

  describe('copy reasoning button', () => {
    it('renders a copy reasoning button', () => {
      render(<VerdictDisplay {...defaultPhishingProps} />)
      const button = screen.getByRole('button', { name: /copy/i })
      expect(button).toBeTruthy()
    })

    it('calls clipboard writeText when copy button is clicked', async () => {
      render(<VerdictDisplay {...defaultPhishingProps} />)
      const button = screen.getByRole('button', { name: /copy/i })
      fireEvent.click(button)
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        defaultPhishingProps.reasoning.join('\n')
      )
    })
  })

  describe('color classes', () => {
    it('uses accent-red color class for phishing verdict', () => {
      const { container } = render(<VerdictDisplay {...defaultPhishingProps} />)
      const hasRedClass = container.innerHTML.includes('accent-red')
      expect(hasRedClass).toBe(true)
    })

    it('uses accent-cyan color class for safe verdict', () => {
      const { container } = render(<VerdictDisplay {...defaultSafeProps} />)
      const hasCyanClass = container.innerHTML.includes('accent-cyan')
      expect(hasCyanClass).toBe(true)
    })

    it('does not use accent-red for safe verdict threat meter', () => {
      const { container } = render(<VerdictDisplay {...defaultSafeProps} />)
      const threatMeter = container.querySelector('[data-testid="threat-meter"]')
      expect(threatMeter?.className).not.toContain('accent-red')
    })

    it('does not use accent-cyan for phishing verdict threat meter', () => {
      const { container } = render(<VerdictDisplay {...defaultPhishingProps} />)
      const threatMeter = container.querySelector('[data-testid="threat-meter"]')
      expect(threatMeter?.className).not.toContain('accent-cyan')
    })
  })

  describe('subject rendering', () => {
    it('renders the email subject', () => {
      render(<VerdictDisplay {...defaultPhishingProps} />)
      expect(screen.getByText('Urgent: Verify your account')).toBeTruthy()
    })
  })

  describe('glass-panel container', () => {
    it('uses glass-panel CSS class for the card container', () => {
      const { container } = render(<VerdictDisplay {...defaultPhishingProps} />)
      const glassPanel = container.querySelector('.glass-panel')
      expect(glassPanel).toBeTruthy()
    })
  })

  describe('edge cases', () => {
    it('renders with 0% confidence', () => {
      render(<VerdictDisplay {...defaultPhishingProps} confidence={0} />)
      const el = screen.getByTestId('confidence-display')
      expect(el.getAttribute('data-confidence')).toBe('0')
    })

    it('renders with 100% confidence', () => {
      render(<VerdictDisplay {...defaultPhishingProps} confidence={1} />)
      const el = screen.getByTestId('confidence-display')
      expect(el.getAttribute('data-confidence')).toBe('100')
    })

    it('renders with empty reasoning array', () => {
      render(<VerdictDisplay {...defaultPhishingProps} reasoning={[]} />)
      const items = document.querySelectorAll('li')
      expect(items.length).toBe(0)
    })

    it('renders with single reasoning item', () => {
      render(<VerdictDisplay {...defaultPhishingProps} reasoning={['Single reason']} />)
      expect(screen.getByText('Single reason')).toBeTruthy()
    })
  })
})
