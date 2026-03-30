/**
 * Sentra Extension — Popup script
 * Reads state from chrome.storage and renders the appropriate view.
 */

const DASHBOARD_URL = 'http://localhost:3000/dashboard/user/settings';

const $ = (id) => document.getElementById(id);

async function init() {
  const stored = await chrome.storage.local.get([
    'sentra_auth_token',
    'sentra_user_email',
    'sentra_instance_token',
  ]);

  const dot = $('statusDot');

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
    : 'Not registered';

  $('btnLogout').addEventListener('click', logout);
  $('btnOpenDashboard2').addEventListener('click', openDashboard);
}

async function logout() {
  await chrome.storage.local.remove(['sentra_auth_token', 'sentra_user_email', 'sentra_instance_token']);
  window.location.reload();
}

function openDashboard() {
  chrome.tabs.create({ url: DASHBOARD_URL });
}

document.addEventListener('DOMContentLoaded', init);
