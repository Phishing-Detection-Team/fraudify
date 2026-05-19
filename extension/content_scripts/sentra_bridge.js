/**
 * Sentra Extension — Auth Bridge (content script for localhost:3000)
 *
 * Reads data embedded by the Next.js layout and syncs it to extension storage.
 *
 * Elements written by layout.tsx:
 *   #sentra-locale-data  — always present; contains { language }
 *   #sentra-ext-data     — only when authenticated; contains { token, email, language }
 *
 * - All page visits:      sync locale so the popup language matches the dashboard
 * - Authenticated pages:  sends SET_AUTH_TOKEN  → popup shows logged-in view
 * - Login / logged-out:   sends CLEAR_AUTH_TOKEN → popup shows login prompt
 */
(function sentraBridge() {
  // Always sync locale — works for both authenticated and unauthenticated users.
  const localeEl = document.getElementById('sentra-locale-data');
  if (localeEl && localeEl.textContent) {
    try {
      const localeData = JSON.parse(localeEl.textContent);
      if (localeData.language === 'vi' || localeData.language === 'en') {
        chrome.storage.local.set({ sentra_locale: localeData.language });
      }
    } catch (_) {}
  }

  // Sync auth token separately.
  const el = document.getElementById('sentra-ext-data');

  if (!el || !el.textContent) {
    // No element → user is not authenticated; clear any stale token
    chrome.runtime.sendMessage({ type: 'CLEAR_AUTH_TOKEN' });
    return;
  }

  let data;
  try {
    data = JSON.parse(el.textContent);
  } catch (_) {
    return; // malformed JSON — leave storage untouched
  }

  if (data && data.token) {
    chrome.runtime.sendMessage({
      type: 'SET_AUTH_TOKEN',
      token: data.token,
      email: data.email || '',
    });
  } else {
    chrome.runtime.sendMessage({ type: 'CLEAR_AUTH_TOKEN' });
  }
})();
