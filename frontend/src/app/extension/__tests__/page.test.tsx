import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExtensionPage from '../page'

describe('ExtensionPage (install guide)', () => {
  it('renders the page without crashing', () => {
    render(<ExtensionPage />)
    expect(document.body).toBeTruthy()
  })

  it('shows the Sentra extension name or heading', () => {
    render(<ExtensionPage />)
    expect(screen.getByRole('heading', { name: /sentra/i })).toBeTruthy()
  })

  it('contains Chrome and Edge install references', () => {
    render(<ExtensionPage />)
    const text = document.body.innerText ?? document.body.textContent ?? ''
    expect(text.toLowerCase()).toMatch(/chrome|edge/)
  })

  it('shows step-by-step install instructions', () => {
    render(<ExtensionPage />)
    // Should have numbered steps or a list of instructions
    const items = document.querySelectorAll('ol li, [data-testid="install-step"]')
    expect(items.length).toBeGreaterThanOrEqual(3)
  })

  it('has a link to the extensions settings page', () => {
    render(<ExtensionPage />)
    const links = document.querySelectorAll('a, code')
    const hasExtensionsLink = Array.from(links).some(
      (el) => el.textContent?.includes('extensions') || el.textContent?.includes('edge://extensions')
    )
    expect(hasExtensionsLink).toBe(true)
  })
})
