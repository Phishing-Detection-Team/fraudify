import React from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'

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
// Mock recharts — replace all chart components with testable stubs
// ---------------------------------------------------------------------------
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  LineChart: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey }: { dataKey: string }) =>
    <div data-testid={`line-${dataKey}`} />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="responsive-container">{children}</div>,
  LinearGradient: ({ children }: { children: React.ReactNode }) =>
    <defs>{children}</defs>,
  defs: ({ children }: { children: React.ReactNode }) => <defs>{children}</defs>,
  stop: () => <stop />,
}))

// ---------------------------------------------------------------------------
// Mock lucide-react
// ---------------------------------------------------------------------------
vi.mock('lucide-react', () => ({
  Loader2: () => <svg data-testid="loader-icon" />,
  Brain:   () => <svg data-testid="brain-icon" />,
  Target:  () => <svg data-testid="target-icon" />,
  TrendingUp: () => <svg data-testid="trending-icon" />,
  AlertTriangle: () => <svg data-testid="alert-icon" />,
}))

// ---------------------------------------------------------------------------
// Mock admin-api
// ---------------------------------------------------------------------------
vi.mock('@/lib/admin-api', () => ({
  getIntelligenceStats: vi.fn(),
}))

import { getIntelligenceStats } from '@/lib/admin-api'
import type { IntelligenceStats } from '@/lib/admin-api'
import IntelligencePanel from '@/components/admin/IntelligencePanel'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeStats(overrides: Partial<IntelligenceStats> = {}): IntelligenceStats {
  return {
    confidence_distribution: [
      { bucket: '0-20%',   count: 5  },
      { bucket: '20-40%',  count: 12 },
      { bucket: '40-60%',  count: 8  },
      { bucket: '60-80%',  count: 15 },
      { bucket: '80-100%', count: 30 },
    ],
    accuracy_over_rounds: [
      { round_id: 1, accuracy: 0.72, completed_at: '2026-01-01T00:00:00' },
      { round_id: 2, accuracy: 0.88, completed_at: '2026-02-01T00:00:00' },
    ],
    fp_fn_rates: [
      { round_id: 1, false_positive_rate: 0.05, false_negative_rate: 0.12 },
      { round_id: 2, false_positive_rate: 0.02, false_negative_rate: 0.08 },
    ],
    top_phishing_words: [
      { word: 'urgent', count: 45 },
      { word: 'verify', count: 30 },
      { word: 'account', count: 22 },
      { word: 'secure', count: 18 },
      { word: 'click', count: 12 },
    ],
    ...overrides,
  }
}

const EMPTY_STATS: IntelligenceStats = {
  confidence_distribution: [],
  accuracy_over_rounds: [],
  fp_fn_rates: [],
  top_phishing_words: [],
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('IntelligencePanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  // -------------------------------------------------------------------------
  // 1. Loading skeleton
  // -------------------------------------------------------------------------
  describe('loading state', () => {
    it('shows loading skeleton while fetching data', async () => {
      // Keep the promise pending so loading state persists
      let resolveStats!: (value: IntelligenceStats) => void
      vi.mocked(getIntelligenceStats).mockReturnValue(
        new Promise<IntelligenceStats>((resolve) => { resolveStats = resolve })
      )

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      expect(screen.getByTestId('intelligence-loading')).toBeTruthy()

      // Resolve to avoid pending promise after test
      await act(async () => { resolveStats(makeStats()) })
    })

    it('hides loading skeleton after data loads', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        expect(screen.queryByTestId('intelligence-loading')).toBeNull()
      })
    })
  })

  // -------------------------------------------------------------------------
  // 2. Confidence distribution chart
  // -------------------------------------------------------------------------
  describe('confidence distribution chart', () => {
    it('renders a BarChart for confidence distribution', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        expect(screen.getByTestId('confidence-distribution-chart')).toBeTruthy()
      })
    })

    it('renders inside the chart container', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        const chart = screen.getByTestId('confidence-distribution-chart')
        // Should contain a bar-chart stub
        expect(chart.querySelector('[data-testid="bar-chart"]')).toBeTruthy()
      })
    })
  })

  // -------------------------------------------------------------------------
  // 3. Accuracy trend chart
  // -------------------------------------------------------------------------
  describe('accuracy trend chart', () => {
    it('renders a LineChart for accuracy over rounds', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        expect(screen.getByTestId('accuracy-trend-chart')).toBeTruthy()
      })
    })

    it('contains a line element for accuracy', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        const chart = screen.getByTestId('accuracy-trend-chart')
        expect(chart.querySelector('[data-testid="line-accuracy"]')).toBeTruthy()
      })
    })
  })

  // -------------------------------------------------------------------------
  // 4. FP/FN rates chart
  // -------------------------------------------------------------------------
  describe('FP/FN rates chart', () => {
    it('renders a dual-line chart for FP and FN rates', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        expect(screen.getByTestId('fpfn-rates-chart')).toBeTruthy()
      })
    })

    it('contains line elements for both FP and FN rates', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        const chart = screen.getByTestId('fpfn-rates-chart')
        expect(chart.querySelector('[data-testid="line-false_positive_rate"]')).toBeTruthy()
        expect(chart.querySelector('[data-testid="line-false_negative_rate"]')).toBeTruthy()
      })
    })
  })

  // -------------------------------------------------------------------------
  // 5. Word chip cloud
  // -------------------------------------------------------------------------
  describe('top phishing words chip cloud', () => {
    it('renders a chip for each top phishing word', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        expect(screen.getByTestId('word-cloud')).toBeTruthy()
      })

      const wordCloud = screen.getByTestId('word-cloud')
      const chips = wordCloud.querySelectorAll('[data-testid^="word-chip-"]')
      expect(chips.length).toBe(5)
    })

    it('renders chip text matching the word', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        expect(screen.getByTestId('word-chip-urgent')).toBeTruthy()
      })

      expect(screen.getByTestId('word-chip-urgent').textContent).toBe('urgent')
    })
  })

  // -------------------------------------------------------------------------
  // 6. data-testid on word chips
  // -------------------------------------------------------------------------
  describe('word chip data-testid attributes', () => {
    it('each word chip has data-testid="word-chip-{word}"', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        expect(screen.getByTestId('word-chip-urgent')).toBeTruthy()
        expect(screen.getByTestId('word-chip-verify')).toBeTruthy()
        expect(screen.getByTestId('word-chip-account')).toBeTruthy()
        expect(screen.getByTestId('word-chip-secure')).toBeTruthy()
        expect(screen.getByTestId('word-chip-click')).toBeTruthy()
      })
    })
  })

  // -------------------------------------------------------------------------
  // 7. Empty data "No data available" message
  // -------------------------------------------------------------------------
  describe('empty data states', () => {
    it('shows "No data available" when confidence_distribution is empty', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(
        makeStats({ confidence_distribution: [] })
      )

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        const panel = screen.getByTestId('confidence-distribution-chart')
        expect(panel.textContent).toMatch(/no data available/i)
      })
    })

    it('shows "No data available" when accuracy_over_rounds is empty', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(
        makeStats({ accuracy_over_rounds: [] })
      )

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        const panel = screen.getByTestId('accuracy-trend-chart')
        expect(panel.textContent).toMatch(/no data available/i)
      })
    })

    it('shows "No data available" when fp_fn_rates is empty', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(
        makeStats({ fp_fn_rates: [] })
      )

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        const panel = screen.getByTestId('fpfn-rates-chart')
        expect(panel.textContent).toMatch(/no data available/i)
      })
    })

    it('shows "No data available" when top_phishing_words is empty', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(
        makeStats({ top_phishing_words: [] })
      )

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        const panel = screen.getByTestId('word-cloud')
        expect(panel.textContent).toMatch(/no data available/i)
      })
    })

    it('renders all empty states when all arrays are empty', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(EMPTY_STATS)

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        const allNoData = screen.getAllByText(/no data available/i)
        expect(allNoData.length).toBeGreaterThanOrEqual(4)
      })
    })
  })

  // -------------------------------------------------------------------------
  // 8. API call with correct token
  // -------------------------------------------------------------------------
  describe('API integration', () => {
    it('calls getIntelligenceStats with the provided token', async () => {
      vi.mocked(getIntelligenceStats).mockResolvedValue(makeStats())

      await act(async () => { render(<IntelligencePanel token="my-secret-token" />) })

      await waitFor(() => {
        expect(vi.mocked(getIntelligenceStats)).toHaveBeenCalledWith('my-secret-token')
      })
    })

    it('does not crash when getIntelligenceStats rejects', async () => {
      vi.mocked(getIntelligenceStats).mockRejectedValue(new Error('Network error'))

      await act(async () => { render(<IntelligencePanel token="test-token" />) })

      await waitFor(() => {
        expect(screen.queryByTestId('intelligence-loading')).toBeNull()
      })
    })
  })
})
