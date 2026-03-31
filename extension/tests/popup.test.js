/**
 * Tests for extension/popup/popup.js — scan history rendering
 * Uses jsdom (configured as testEnvironment in package.json).
 *
 * Strategy: set up the DOM from popup.html structure, seed chrome.storage,
 * then call the exported renderScanHistory helper directly.
 */

// Import the module under test after DOM is ready
let renderScanHistory;

beforeAll(() => {
  // Build the minimal DOM that popup.js scan history rendering depends on
  document.body.innerHTML = `
    <div id="viewMain" class="view">
      <div id="scan-history-section" class="section">
        <div class="section-title">Recent Scans</div>
        <ul id="scan-history-list" class="scan-history-list"></ul>
        <div id="scan-history-empty" class="empty-state" style="display:none">No scans yet</div>
        <a href="#" id="view-all-link" class="view-all-link">View all in dashboard &rarr;</a>
      </div>
    </div>
  `;

  const mod = require('../popup/popup');
  renderScanHistory = mod.renderScanHistory;
});

beforeEach(() => {
  chrome.storage.local._reset();
  // Reset DOM between tests
  document.getElementById('scan-history-list').innerHTML = '';
  document.getElementById('scan-history-empty').style.display = 'none';
  document.getElementById('scan-history-list').style.display = '';
});

// ---------------------------------------------------------------------------
// renderScanHistory
// ---------------------------------------------------------------------------

describe('renderScanHistory', () => {
  it('shows "No scans yet" empty state when sentra_scan_history is empty', async () => {
    await chrome.storage.local.set({ sentra_scan_history: [] });

    await renderScanHistory();

    const emptyEl = document.getElementById('scan-history-empty');
    const listEl = document.getElementById('scan-history-list');
    expect(emptyEl.style.display).not.toBe('none');
    expect(listEl.children).toHaveLength(0);
  });

  it('renders a list item for each scan history entry', async () => {
    await chrome.storage.local.set({
      sentra_scan_history: [
        { subject: 'Email one', verdict: 'safe', confidence: 0.8, timestamp: Date.now() - 60000 },
        { subject: 'Email two', verdict: 'phishing', confidence: 0.95, timestamp: Date.now() - 120000 },
      ],
    });

    await renderScanHistory();

    const listEl = document.getElementById('scan-history-list');
    expect(listEl.children).toHaveLength(2);
  });

  it('shows green circle emoji for safe verdict', async () => {
    await chrome.storage.local.set({
      sentra_scan_history: [
        { subject: 'Safe email', verdict: 'safe', confidence: 0.9, timestamp: Date.now() },
      ],
    });

    await renderScanHistory();

    const listEl = document.getElementById('scan-history-list');
    expect(listEl.innerHTML).toContain('\uD83D\uDFE2'); // 🟢
  });

  it('shows red circle emoji for phishing verdict', async () => {
    await chrome.storage.local.set({
      sentra_scan_history: [
        { subject: 'Phishing email', verdict: 'phishing', confidence: 0.99, timestamp: Date.now() },
      ],
    });

    await renderScanHistory();

    const listEl = document.getElementById('scan-history-list');
    expect(listEl.innerHTML).toContain('\uD83D\uDD34'); // 🔴
  });

  it('truncates subject to 40 characters', async () => {
    const longSubject = 'A'.repeat(60);
    await chrome.storage.local.set({
      sentra_scan_history: [
        { subject: longSubject, verdict: 'safe', confidence: 0.7, timestamp: Date.now() },
      ],
    });

    await renderScanHistory();

    const listEl = document.getElementById('scan-history-list');
    const text = listEl.textContent;
    // The rendered subject must not contain all 60 A's
    expect(text).not.toContain('A'.repeat(41));
  });

  it('sets view-all-link href to the dashboard scan page', async () => {
    await chrome.storage.local.set({ sentra_scan_history: [] });

    await renderScanHistory();

    const link = document.getElementById('view-all-link');
    expect(link.href).toBe('http://localhost:3000/dashboard/user/scan');
  });
});
