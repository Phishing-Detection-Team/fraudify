/**
 * Sentra Extension — API client
 * Shared by the service worker and popup.
 * Pure functions with no side-effects; easy to unit-test.
 */

const DEFAULT_API_URL = 'http://localhost:5000';

/**
 * Scan an email for phishing via the Sentra backend.
 *
 * @param {string} apiUrl     - Backend base URL
 * @param {string} authToken  - User's JWT access token
 * @param {string} subject    - Email subject (may be empty)
 * @param {string} body       - Email body text (required)
 * @returns {Promise<object>} - { success, verdict, confidence, scam_score, reasoning, id }
 */
async function scanEmail(apiUrl, authToken, subject, body) {
  const res = await fetch(`${apiUrl}/api/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({ subject, body }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/**
 * Register this extension instance with the backend.
 * Called once on install (when the user is logged in).
 *
 * @param {string} apiUrl        - Backend base URL
 * @param {string} authToken     - User's JWT access token
 * @param {object} browserInfo   - { browser, os_name }
 * @returns {Promise<object>}    - { success, instance_token, ... }
 */
async function registerInstance(apiUrl, authToken, browserInfo) {
  const res = await fetch(`${apiUrl}/api/extension/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify(browserInfo),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

/**
 * Send a heartbeat to keep this instance marked as active.
 * Intentionally unauthenticated — uses instance_token only.
 *
 * @param {string} apiUrl         - Backend base URL
 * @param {string} instanceToken  - Extension instance token
 * @returns {Promise<object>}     - { success }
 */
async function sendHeartbeat(apiUrl, instanceToken) {
  const res = await fetch(`${apiUrl}/api/extension/heartbeat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instance_token: instanceToken }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

// CommonJS export for Jest; in the extension itself the functions are globals.
/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = { scanEmail, registerInstance, sendHeartbeat, DEFAULT_API_URL };
}
