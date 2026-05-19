/**
 * Sentra Extension — Popup script
 * Reads state from chrome.storage and renders the appropriate view.
 */

const DASHBOARD_URL = 'http://localhost:3000/dashboard/user/settings';
const DASHBOARD_SCAN_URL = 'http://localhost:3000/dashboard/user/scan';

const $ = (id) => document.getElementById(id);

// ---------------------------------------------------------------------------
// Time-ago formatter
// ---------------------------------------------------------------------------

function _timeAgo(timestamp, locale) {
  const t = (key) => extT(locale, 'time', key);
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return t('justNow');
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}${t('mAgo')}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('hAgo')}`;
  const days = Math.floor(hours / 24);
  return `${days}${t('dAgo')}`;
}

// ---------------------------------------------------------------------------
// Verdict badge
// ---------------------------------------------------------------------------

function _verdictBadge(verdict) {
  if (verdict === 'phishing') return '🔴'; // 🔴
  if (verdict === 'safe') return '🟢';     // 🟢
  return '🟡';                              // 🟡 suspicious / other
}

// ---------------------------------------------------------------------------
// Apply translations to all static text elements
// ---------------------------------------------------------------------------

function applyTranslations(locale) {
  const p = (key) => extT(locale, 'popup', key);

  const el = {
    loginHint:        $('loginHint'),
    btnOpenDashboard: $('btnOpenDashboard'),
    labelLoggedInAs:  $('labelLoggedInAs'),
    labelInstance:    $('labelInstance'),
    scanHint:         $('scanHint'),
    labelRecentScans: $('labelRecentScans'),
    scanHistoryEmpty: $('scan-history-empty'),
    viewAllLink:      $('view-all-link'),
    btnLogout:        $('btnLogout'),
    btnOpenDashboard2:$('btnOpenDashboard2'),
    btnLangToggle:    $('btnLangToggle'),
  };

  if (el.loginHint)         el.loginHint.textContent        = p('loginHint');
  if (el.btnOpenDashboard)  el.btnOpenDashboard.textContent  = p('openDashboard');
  if (el.labelLoggedInAs)   el.labelLoggedInAs.textContent   = p('loggedInAs');
  if (el.labelInstance)     el.labelInstance.textContent     = p('instance');
  if (el.scanHint)          el.scanHint.textContent          = p('scanHint');
  if (el.labelRecentScans)  el.labelRecentScans.textContent  = p('recentScans');
  if (el.scanHistoryEmpty)  el.scanHistoryEmpty.textContent  = p('noScans');
  if (el.viewAllLink)       el.viewAllLink.textContent       = p('viewAll');
  if (el.btnLogout)         el.btnLogout.textContent         = p('logOut');
  if (el.btnOpenDashboard2) el.btnOpenDashboard2.textContent = p('openDashboard2');
  if (el.btnLangToggle)     el.btnLangToggle.textContent     = locale.toUpperCase();
}

// ---------------------------------------------------------------------------
// Scan history renderer (exported for unit tests)
// ---------------------------------------------------------------------------

async function renderScanHistory(locale) {
  const { sentra_scan_history: history = [] } = await chrome.storage.local.get('sentra_scan_history');

  const listEl = $('scan-history-list');
  const emptyEl = $('scan-history-empty');
  const linkEl = $('view-all-link');

  if (linkEl) {
    linkEl.href = DASHBOARD_SCAN_URL;
  }

  if (!history.length) {
    if (emptyEl) emptyEl.style.display = '';
    if (listEl) listEl.style.display = 'none';
    return;
  }

if (emptyEl) emptyEl.style.display = 'none';
  if (listEl) listEl.style.display = '';

  listEl.replaceChildren(
    ...history.map((entry) => {
      const badge = _verdictBadge(entry.verdict);
      const subject = (entry.subject || '').slice(0, 40);
      const time = _timeAgo(entry.timestamp, locale || 'en');

      const li = document.createElement('li');
      li.className = 'scan-history-item';

      const badgeSpan = document.createElement('span');
      badgeSpan.className = 'verdict-badge';
      badgeSpan.textContent = badge;

      const subjectSpan = document.createElement('span');
      subjectSpan.className = 'scan-subject';
      subjectSpan.textContent = subject;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'scan-time';
      timeSpan.textContent = time;

      li.append(badgeSpan, subjectSpan, timeSpan);
      return li;
    })
  );
}

// ---------------------------------------------------------------------------
// Main init
// ---------------------------------------------------------------------------

async function init() {
  const locale = await getExtLocale();
  applyTranslations(locale);

  const stored = await chrome.storage.local.get([
    'sentra_auth_token',
    'sentra_user_email',
    'sentra_instance_token',
  ]);

  const dot = $('statusDot');

  // Language toggle
  const btnLang = $('btnLangToggle');
  if (btnLang) {
    btnLang.addEventListener('click', async () => {
      const current = await getExtLocale();
      const next = current === 'en' ? 'vi' : 'en';
      await chrome.storage.local.set({ sentra_locale: next });
      applyTranslations(next);
      await renderScanHistory(next);
    });
  }

  if (!stored.sentra_auth_token) {
    // Not logged in
    dot.className = 'status-dot disconnected';
    $('viewLogin').classList.remove('hidden');
    $('btnOpenDashboard').addEventListener('click', openDashboard);
    return;
  }

  // Logged in
  dot.className = 'status-dot connected';
  $('viewMain').classList.remove('hidden');
  $('userEmail').textContent = stored.sentra_user_email || 'Unknown';
  $('instanceToken').textContent = stored.sentra_instance_token
    ? stored.sentra_instance_token.slice(0, 12) + '…'
    : extT(locale, 'popup', 'notRegistered');

  $('btnLogout').addEventListener('click', logout);
  $('btnOpenDashboard2').addEventListener('click', openDashboard);
  $('btnRefreshHistory').addEventListener('click', () => renderScanHistory(locale));

  // Auto-refresh the list whenever the content script writes a new scan result
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.sentra_scan_history) renderScanHistory(locale);
  });

  await renderScanHistory(locale);
}

async function logout() {
  await chrome.storage.local.remove(['sentra_auth_token', 'sentra_user_email', 'sentra_instance_token']);
  window.location.reload();
}

function openDashboard() {
  chrome.tabs.create({ url: DASHBOARD_URL });
}

document.addEventListener('DOMContentLoaded', init);

// CommonJS export for Jest
if (typeof module !== 'undefined') {
  module.exports = { renderScanHistory, _timeAgo, _verdictBadge };
}
