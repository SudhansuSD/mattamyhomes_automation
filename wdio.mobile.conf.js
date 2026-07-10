require("dotenv").config();
require("ts-node/register/transpile-only");

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { Status } = require("allure-js-commons");
const allureReporter = require("@wdio/allure-reporter").default;
const { getEnvConfig } = require("./config/environments/envConfig");
const { MOBILE_ALLURE_RESULTS_DIR } = require("./scripts/allurePaths");
const { getMobilePlatform, getMobilePlatformLabel } = require("./utils/mobilePlatform");

// android (default) | ios. Selects capabilities + session-reset strategy below.
const mobilePlatform = getMobilePlatform();

// .env may define these with a trailing newline/whitespace; Appium rejects the
// path as "does not exist" unless we trim it.
for (const name of ["ANDROID_HOME", "ANDROID_SDK_ROOT"]) {
  if (process.env[name]) {
    process.env[name] = process.env[name].trim();
  }
}

const androidUdid = process.env.APPIUM_UDID || "emulator-5554";

// Best-effort adb call; failures are logged but never abort the run.
// No-op on iOS: adb is Android-only, so the Chrome reset hooks below simply skip on iOS Safari.
function adb(args) {
  if (mobilePlatform !== "android") {
    return;
  }

  const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const bin = process.platform === "win32" ? "adb.exe" : "adb";
  const adbPath = sdkRoot ? path.join(sdkRoot, "platform-tools", bin) : bin;

  try {
    execFileSync(adbPath, args, { stdio: "ignore", timeout: 30000 });
  } catch (error) {
    console.log(`adb ${args.join(" ")} failed:`, error.message);
  }
}

// Android Chrome occasionally crashes its renderer/session mid-test on the
// emulator. Detect that and recover by relaunching a fresh session instead of
// failing the whole suite.
function isSessionLostError(error) {
  return /invalid session id|browser has closed the connection|disconnected|chrome not reachable|unable to receive message from renderer/i.test(
    String(error?.message || error),
  );
}

async function reloadMobileSession() {
  adb(["-s", androidUdid, "shell", "am", "force-stop", "com.android.chrome"]);
  await browser.reloadSession();
  await browser.setTimeout({ implicit: 0, pageLoad: 60000, script: 60000 });
}

async function ensureMobileSession() {
  try {
    if (browser.sessionId) {
      await browser.getUrl();
    }
  } catch (error) {
    if (!isSessionLostError(error)) {
      throw error;
    }

    await reloadMobileSession();
  }
}

// Resolve the mobile base URL from env or the shared environment config.
// Mattamy redirects the apex domain to www, so use www directly to skip a hop.
function getMobileBaseUrl() {
  const url = new URL(process.env.MOBILE_BASE_URL || getEnvConfig().baseURL);

  if (url.hostname.toLowerCase() === "mattamyhomes.com") {
    url.hostname = "www.mattamyhomes.com";
  }

  return url.toString().replace(/\/$/, "");
}

const appiumPort = Number(process.env.APPIUM_PORT || 4723);
const specLogDir = path.join(__dirname, "log", "wdio", "spec-tests");
let specTestLogPath;

function getCurrentSpecPath() {
  const specArgIndex = process.argv.indexOf("--spec");
  const specFromArg = specArgIndex >= 0 ? process.argv[specArgIndex + 1] : "";
  const wdioBrowser = typeof browser === "undefined" ? undefined : browser;
  const specFromBrowser = wdioBrowser?.options?.specs?.[0] || "";

  return specFromArg || specFromBrowser || "mobile-web";
}

function getSpecTestLogPath() {
  if (specTestLogPath) {
    return specTestLogPath;
  }

  const specPath = getCurrentSpecPath();
  const specName = path.basename(specPath, path.extname(specPath)) || "mobile-web";

  specTestLogPath = path.join(specLogDir, `${specName}.tests.log`);
  return specTestLogPath;
}

function cleanLogMessage(message) {
  return String(message || "")
    .replace(/\s+/g, " ")
    .trim();
}

function addAllureMobileStep(message, status = Status.PASSED) {
  try {
    allureReporter.addStep(cleanLogMessage(message), undefined, status);
  } catch {
    // Allure context is not always available during early config hooks.
  }
}

function writeSpecTestLog(message, options = {}) {
  const cleanMessage = cleanLogMessage(message);

  // Echo every step to the console so the run is readable live, not just in the
  // per-spec log file. Opt out with MOBILE_LOG_CONSOLE=false.
  if (process.env.MOBILE_LOG_CONSOLE !== "false") {
    console.log(cleanMessage);
  }

  try {
    fs.mkdirSync(specLogDir, { recursive: true });
    fs.appendFileSync(getSpecTestLogPath(), `${new Date().toISOString()} ${cleanMessage}\n`);
  } catch (error) {
    console.log("Unable to write spec test log:", error.message);
  }

  if (options.allure) {
    addAllureMobileStep(cleanMessage, options.status);
  }
}

function getTestTitle(test) {
  if (typeof test?.fullTitle === "function") {
    return test.fullTitle();
  }

  return test?.fullTitle || test?.title || test?.parent || "Unnamed mobile test";
}

function getHookTitle(hook, hookName) {
  const title = getTestTitle(hook);
  return hookName ? `${hookName} ${title}` : title;
}

// Android Chrome capabilities (UiAutomator2). Chrome-specific options only apply here.
function buildAndroidCapabilities() {
  return {
    platformName: "Android",
    browserName: "Chrome",
    // "eager" returns control once the DOM is interactive instead of waiting
    // on every subresource, which keeps mobile navigation responsive.
    pageLoadStrategy: "eager",

    "appium:automationName": "UiAutomator2",
    "appium:deviceName": process.env.APPIUM_DEVICE_NAME || "Android Emulator",
    "appium:udid": androidUdid,

    // Start each session from a clean Chrome profile. Caching the profile was
    // slower in practice: Chrome restored the previous run's heavy tab and
    // stalled the renderer while loading the next page.
    "appium:noReset": false,

    "appium:autoGrantPermissions": true,
    // Match ChromeDriver to the device's Chrome version automatically.
    "appium:chromedriverAutodownload": true,

    "goog:chromeOptions": {
      androidPackage: "com.android.chrome",
      // Start a fresh Chrome instance and skip the first-run/welcome screens
      // and popups that would otherwise block page navigation.
      androidUseRunningApp: false,
      args: [
        "--no-first-run",
        "--disable-fre",
        "--disable-popup-blocking",
        "--disable-notifications",
      ],
    },
  };
}

// iOS Safari capabilities (XCUITest). Requires macOS + Xcode + `appium driver install xcuitest`.
// Set APPIUM_DEVICE_NAME / APPIUM_PLATFORM_VERSION (and optionally APPIUM_UDID) to target a
// specific simulator or real device.
function buildIosCapabilities() {
  const capabilities = {
    platformName: "iOS",
    browserName: "Safari",

    "appium:automationName": "XCUITest",
    "appium:deviceName": process.env.APPIUM_DEVICE_NAME || "iPhone 15",
    "appium:platformVersion": process.env.APPIUM_PLATFORM_VERSION || "17.0",

    // Auto-dismiss Safari/system prompts that would otherwise block navigation.
    "appium:autoAcceptAlerts": true,
    "appium:safariInitialUrl": "about:blank",
  };

  if (process.env.APPIUM_UDID) {
    capabilities["appium:udid"] = process.env.APPIUM_UDID;
  }

  return capabilities;
}

// One capability set per run, chosen by MOBILE_PLATFORM.
function buildCapabilities() {
  return [mobilePlatform === "ios" ? buildIosCapabilities() : buildAndroidCapabilities()];
}

exports.config = {
  runner: "local",

  specs: [
    "./tests/mobile/mobileWeb.home.spec.js",
    "./tests/mobile/mobileWeb.searchPage.spec.js",
    "./tests/mobile/mobileWeb.community.spec.js",
    "./tests/mobile/mobileWeb.market.spec.js",
    "./tests/mobile/mobileWeb.mpc.spec.js",
    "./tests/mobile/mobileWeb.plan.spec.js",
    "./tests/mobile/mobileWeb.qmi.spec.js",
  ],

  maxInstances: 1,

  hostname: process.env.APPIUM_HOST || "127.0.0.1",
  port: appiumPort,
  path: "/",

  baseUrl: getMobileBaseUrl(),

  logLevel: process.env.WDIO_LOG_LEVEL || "info",
  outputDir: "./log/wdio",

  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: "mocha",

  mochaOpts: {
    ui: "bdd",
    timeout: 180000,
    // Retry once: an intermittent Chrome session crash on the emulator gets a
    // fresh session (via beforeTest) on the second attempt.
    retries: 1,
  },

  reporters: [
    [
      "allure",
      {
        outputDir: MOBILE_ALLURE_RESULTS_DIR,
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  services: [
    [
      "appium",
      {
        command: "appium",
        args: { port: appiumPort, relaxedSecurity: true },
        logPath: "./log/appium",
      },
    ],
  ],

  capabilities: buildCapabilities(),

  beforeSession: function () {
    // Stop Chrome and wipe its data so every Android run starts from a clean, fast slate
    // (no restored tabs, no stale cookies/cache). adb() is a no-op on iOS, where Appium's
    // fresh Safari session provides the clean slate instead.
    adb(["-s", androidUdid, "shell", "am", "force-stop", "com.android.chrome"]);
    adb(["-s", androidUdid, "shell", "pm", "clear", "com.android.chrome"]);
  },

  before: async function () {
    fs.mkdirSync(specLogDir, { recursive: true });
    fs.writeFileSync(
      getSpecTestLogPath(),
      `${new Date().toISOString()} SPEC START [${getMobilePlatformLabel()}] ${getCurrentSpecPath()}\n`,
    );
    globalThis.__mobileSpecStep = (kind, message, status = Status.PASSED) => {
      writeSpecTestLog(`${kind} ${message}`, { allure: true, status });
    };
    await browser.setTimeout({ implicit: 0, pageLoad: 60000, script: 60000 });
  },

  beforeTest: async function (test) {
    writeSpecTestLog(`TEST START ${getTestTitle(test)}`, { allure: true });
    await ensureMobileSession();
  },

  beforeHook: function (hook, context, hookName) {
    writeSpecTestLog(`ACTION HOOK START ${getHookTitle(hook, hookName)}`, { allure: true });
  },

  afterHook: function (hook, context, result, hookName) {
    const error = result?.error;
    writeSpecTestLog(
      error
        ? `FAIL HOOK ${getHookTitle(hook, hookName)} | ${cleanLogMessage(error?.message || error).slice(0, 1000)}`
        : `PASS HOOK ${getHookTitle(hook, hookName)}`,
      { allure: true, status: error ? Status.FAILED : Status.PASSED },
    );
  },

  afterTest: async function (test, context, { error }) {
    writeSpecTestLog(
      error
        ? `FAIL TEST ${getTestTitle(test)} | ${cleanLogMessage(error?.message || error).slice(0, 1000)}`
        : `PASS TEST ${getTestTitle(test)}`,
      { allure: true, status: error ? Status.FAILED : Status.PASSED },
    );

    if (!error) {
      return;
    }

    // Recover a lost session so the retry / next test starts clean.
    if (isSessionLostError(error)) {
      await reloadMobileSession();
      return;
    }

    if (browser.sessionId) {
      try {
        const screenshot = await browser.takeScreenshot();
        allureReporter.addAttachment(
          "Failure screenshot",
          Buffer.from(screenshot, "base64"),
          "image/png",
        );
      } catch (screenshotError) {
        console.log("Unable to capture failure screenshot:", screenshotError.message);
      }
    }
  },
};
