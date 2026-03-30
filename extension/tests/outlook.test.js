/**
 * Tests for extension/content_scripts/outlook.js
 * Written BEFORE implementation (TDD RED phase).
 */

const {
  extractEmailFromDOM,
  buildOverlayHTML,
  injectOverlay,
  removeOverlay,
  getOverlayId,
} = require('../content_scripts/outlook');

// ---------------------------------------------------------------------------
// extractEmailFromDOM
// ---------------------------------------------------------------------------

describe('extractEmailFromDOM (Outlook)', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('extracts subject from [data-testid="subject"]', () => {
    document.body.innerHTML = `
      <div data-testid="subject">Urgent: Verify your account</div>
      <div data-testid="UniqueMessageBody">Please click the link below.</div>
    `;

    const { subject } = extractEmailFromDOM();
    expect(subject).toBe('Urgent: Verify your account');
  });

  it('extracts body from [data-testid="UniqueMessageBody"]', () => {
    document.body.innerHTML = `
      <div data-testid="subject">Subject</div>
      <div data-testid="UniqueMessageBody">Message body content.</div>
    `;

    const { body } = extractEmailFromDOM();
    expect(body).toBe('Message body content.');
  });

  it('falls back to .ReadingPaneContents for body when primary selector not found', () => {
    document.body.innerHTML = `
      <div data-testid="subject">Subject</div>
      <div class="ReadingPaneContents">Fallback body text.</div>
    `;

    const { body } = extractEmailFromDOM();
    expect(body).toBe('Fallback body text.');
  });

  it('returns empty strings when elements are not found', () => {
    document.body.innerHTML = '<div>Unrelated content</div>';

    const { subject, body } = extractEmailFromDOM();
    expect(subject).toBe('');
    expect(body).toBe('');
  });

  it('trims whitespace from extracted text', () => {
    document.body.innerHTML = `
      <div data-testid="subject">  Padded Subject  </div>
      <div data-testid="UniqueMessageBody">  Padded body  </div>
    `;

    const { subject, body } = extractEmailFromDOM();
    expect(subject).toBe('Padded Subject');
    expect(body).toBe('Padded body');
  });
});

// ---------------------------------------------------------------------------
// buildOverlayHTML
// ---------------------------------------------------------------------------

describe('buildOverlayHTML (Outlook)', () => {
  it('returns a non-empty HTML string', () => {
    const html = buildOverlayHTML({ verdict: 'phishing', confidence: 0.88 });
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
  });

  it('indicates threat for phishing verdict', () => {
    const html = buildOverlayHTML({ verdict: 'phishing', confidence: 0.88 });
    expect(html.toLowerCase()).toMatch(/phishing|threat|danger/);
  });

  it('indicates safe for legitimate verdict', () => {
    const html = buildOverlayHTML({ verdict: 'legitimate', confidence: 0.99 });
    expect(html.toLowerCase()).toMatch(/safe|legitimate|clean/);
  });

  it('includes confidence percentage', () => {
    const html = buildOverlayHTML({ verdict: 'phishing', confidence: 0.88 });
    expect(html).toContain('88');
  });

  it('uses overlay id for deduplication', () => {
    const html = buildOverlayHTML({ verdict: 'phishing', confidence: 0.9 });
    expect(html).toContain(getOverlayId());
  });
});

// ---------------------------------------------------------------------------
// injectOverlay / removeOverlay (Outlook)
// ---------------------------------------------------------------------------

describe('injectOverlay / removeOverlay (Outlook)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-testid="UniqueMessageBody"><p>Email body</p></div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('injects overlay into the DOM', () => {
    injectOverlay({ verdict: 'phishing', confidence: 0.88 });
    expect(document.getElementById(getOverlayId())).not.toBeNull();
  });

  it('overlay contains verdict information', () => {
    injectOverlay({ verdict: 'phishing', confidence: 0.88 });
    const el = document.getElementById(getOverlayId());
    expect(el.textContent.toLowerCase()).toMatch(/phishing|threat|danger/);
  });

  it('replaces existing overlay on second inject', () => {
    injectOverlay({ verdict: 'phishing', confidence: 0.8 });
    injectOverlay({ verdict: 'legitimate', confidence: 0.99 });
    const overlays = document.querySelectorAll(`#${getOverlayId()}`);
    expect(overlays.length).toBe(1);
  });

  it('removeOverlay removes the overlay element', () => {
    injectOverlay({ verdict: 'phishing', confidence: 0.8 });
    removeOverlay();
    expect(document.getElementById(getOverlayId())).toBeNull();
  });

  it('removeOverlay does nothing when no overlay present', () => {
    expect(() => removeOverlay()).not.toThrow();
  });

  it('falls back to .ReadingPaneContents container for injection', () => {
    document.body.innerHTML = `
      <div class="ReadingPaneContents"><p>Email body</p></div>
    `;
    injectOverlay({ verdict: 'phishing', confidence: 0.8 });
    expect(document.getElementById(getOverlayId())).not.toBeNull();
  });

  it('does not inject when no container found', () => {
    document.body.innerHTML = '<div>No container</div>';
    injectOverlay({ verdict: 'phishing', confidence: 0.8 });
    expect(document.getElementById(getOverlayId())).toBeNull();
  });
});
