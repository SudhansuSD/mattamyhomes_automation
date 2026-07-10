// Resolves the target platform for the WebdriverIO mobile-web suite so the same specs/page objects
// run on both Android Chrome and iOS Safari. Select the platform with MOBILE_PLATFORM=android|ios
// (default android, so existing Android runs are unchanged).

/** Returns the configured mobile platform: 'ios' or 'android' (default). */
function getMobilePlatform() {
  const raw = String(process.env.MOBILE_PLATFORM || process.env.APPIUM_PLATFORM || 'android')
    .trim()
    .toLowerCase();

  return raw === 'ios' ? 'ios' : 'android';
}

/** True when the suite is targeting iOS Safari. */
function isIOS() {
  return getMobilePlatform() === 'ios';
}

/** True when the suite is targeting Android Chrome. */
function isAndroid() {
  return getMobilePlatform() === 'android';
}

/** Human-readable label for the active platform (used in test titles/logs). */
function getMobilePlatformLabel() {
  return isIOS() ? 'iOS Safari' : 'Android Chrome';
}

/**
 * User-agent matchers for the active platform: { device, browser }.
 * Android Chrome UA contains "Android" + "Chrome"; iOS Safari UA contains "iPhone/iPad" + "Safari"
 * (CriOS covers Chrome-on-iOS, which is still WebKit/Safari under the hood).
 */
function getUserAgentPatterns() {
  if (isIOS()) {
    return { device: /iPhone|iPad|iPod|iOS/i, browser: /Safari|CriOS/i };
  }

  return { device: /Android/i, browser: /Chrome/i };
}

module.exports = {
  getMobilePlatform,
  getMobilePlatformLabel,
  getUserAgentPatterns,
  isAndroid,
  isIOS,
};
