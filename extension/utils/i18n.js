/**
 * Sentra Extension — i18n utility
 * Locale is stored in chrome.storage.local under the key "sentra_locale".
 * The web app writes this key whenever the user changes language.
 */

const EXTENSION_MESSAGES = {
  en: {
    popup: {
      loginHint: "Log in to Sentra to enable email scanning.",
      openDashboard: "Open Sentra Dashboard",
      loggedInAs: "Logged in as",
      instance: "Instance",
      notRegistered: "Not registered",
      scanHint: "Sentra automatically scans emails when you open them in Gmail or Outlook.",
      recentScans: "Recent Scans",
      noScans: "No scans yet",
      viewAll: "View all in dashboard →",
      logOut: "Log Out",
      openDashboard2: "Open Dashboard",
    },
    overlay: {
      phishingDetected: "⚠ Sentra: Phishing Detected",
      suspicious: "⚠ Sentra: Suspicious Email",
      safe: "✓ Sentra: Email Looks Safe",
      analyzing: "⟳ Sentra: Analyzing…",
      confidence: "% confidence",
      unableToDetermine: "Unable to determine verdict.",
      analysisUnavailable: "Sentra: Analysis unavailable",
    },
    time: {
      justNow: "just now",
      mAgo: "m ago",
      hAgo: "h ago",
      dAgo: "d ago",
    },
  },
  vi: {
    popup: {
      loginHint: "Đăng nhập Sentra để bật tính năng quét email.",
      openDashboard: "Mở Bảng điều khiển Sentra",
      loggedInAs: "Đã đăng nhập với",
      instance: "Phiên làm việc",
      notRegistered: "Chưa đăng ký",
      scanHint: "Sentra tự động quét email khi bạn mở chúng trong Gmail hoặc Outlook.",
      recentScans: "Lần quét gần đây",
      noScans: "Chưa có lần quét nào",
      viewAll: "Xem tất cả trên bảng điều khiển →",
      logOut: "Đăng xuất",
      openDashboard2: "Mở bảng điều khiển",
    },
    overlay: {
      phishingDetected: "⚠ Sentra: Phát hiện lừa đảo",
      suspicious: "⚠ Sentra: Email đáng ngờ",
      safe: "✓ Sentra: Email có vẻ an toàn",
      analyzing: "⟳ Sentra: Đang phân tích…",
      confidence: "% độ tin cậy",
      unableToDetermine: "Không thể xác định kết quả.",
      analysisUnavailable: "Sentra: Không thể phân tích",
    },
    time: {
      justNow: "vừa xong",
      mAgo: " phút trước",
      hAgo: " giờ trước",
      dAgo: " ngày trước",
    },
  },
};

async function getExtLocale() {
  try {
    const result = await chrome.storage.local.get('sentra_locale');
    return result.sentra_locale === 'vi' ? 'vi' : 'en';
  } catch {
    return 'en';
  }
}

function extT(locale, section, key) {
  return (EXTENSION_MESSAGES[locale] || EXTENSION_MESSAGES.en)[section]?.[key]
    ?? EXTENSION_MESSAGES.en[section]?.[key]
    ?? key;
}

// CommonJS export for Jest
if (typeof module !== 'undefined') {
  module.exports = { getExtLocale, extT, EXTENSION_MESSAGES };
}
