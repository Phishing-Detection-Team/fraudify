# Sentra Browser Extension

Chrome and Edge (MV3) extension that scans emails in Gmail and Outlook for phishing.

## Prerequisites

- Node.js 18+ (for running tests)
- Chrome or Edge with Developer Mode enabled

## Development Setup

```bash
cd extension
npm install
```

## Running Tests

```bash
npm test
```

Run with coverage:

```bash
npm run coverage
```

## Loading the Extension (Unpacked)

1. Open Chrome: navigate to `chrome://extensions`
   Open Edge: navigate to `edge://extensions`
2. Enable **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `extension/` directory (this folder — the one containing `manifest.json`)
5. The Sentra icon appears in the toolbar

> After editing source files, click the **refresh icon** on the extension card to reload.

## How It Works

| File | Purpose |
|------|---------|
| `manifest.json` | MV3 manifest — declares permissions and entry points |
| `background/service-worker.js` | Registers the instance on install, sends heartbeats every 4 min, proxies scan requests |
| `content_scripts/gmail.js` | Detects email opens in Gmail and overlays a verdict badge |
| `content_scripts/outlook.js` | Same for Outlook Live / Outlook 365 |
| `popup/popup.html` | Toolbar popup (status + manual scan trigger) |
| `utils/api.js` | Shared fetch wrapper pointing to the Sentra backend |

## Configuration

The backend URL defaults to `http://localhost:5000`. To change it for production, update `SENTRA_API_URL` in `utils/api.js` before packing.

## Packing for Distribution

Chrome Web Store / Edge Add-ons submission requires a `.zip`:

```bash
cd ..   # project root
zip -r sentra-extension.zip extension/ \
  --exclude "extension/node_modules/*" \
  --exclude "extension/coverage/*" \
  --exclude "extension/tests/*" \
  --exclude "extension/*.test.js"
```

Then upload `sentra-extension.zip` in the Chrome Web Store Developer Dashboard or Edge Partner Center.

> **Note:** Google requires OAuth App Verification for extensions that request `gmail.readonly`. Submit the verification form after passing initial review.

## Manual Testing Checklist

- [ ] Open Gmail → open any email → Sentra overlay appears with a verdict badge
- [ ] Open Outlook Live (`outlook.live.com`) → open any email → overlay appears
- [ ] Admin dashboard `/dashboard/admin/feed` → extension instance shown as active (heartbeat working)
- [ ] Click the toolbar icon → popup shows connection status
