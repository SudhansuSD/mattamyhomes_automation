import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { Status } from 'allure-js-commons';
import allureReporter from '@wdio/allure-reporter';
import { loadEnv } from './config/env';
import { getEnvConfig } from './config/environments/envConfig';
import { MOBILE_ALLURE_RESULTS_DIR } from './scripts/allurePaths';
import { getMobilePlatform, getMobilePlatformLabel } from './utils/mobilePlatform';

// Load .env (repo-root anchored) before any env var is read below.
loadEnv();

// WebdriverIO's launcher auto-registers a TypeScript loader (ts-node,
// transpile-only) when it detects a .ts config, so no manual
// `ts-node/register` is needed here to load this file or the .ts specs/pages.

// android (default) | ios. Selects capabilities + session-reset strategy below.
const mobilePlatform = getMobilePlatform();

// Permissive local type for the WebdriverIO `browser` global. The mobile suite
// runs under tsconfig.mobile.json (which supplies @wdio/globals ambient types),
// but this root-level config file is also opened in editors whose base tsconfig
// profile doesn't load those types. Declaring the shape locally keeps the file
// type-clean either way; `declare const` is erased at compile time, so the real
// WDIO-injected global is still what runs.
type WdioBrowser = {
  sessionId?: string;
  getUrl(): Promise<string>;
  reloadSession(...args: unknown[]): Promise<unknown>;
  setTimeout(timeouts: { implicit?: number; pageLoad?: number; script?: number }): Promise<void>;
  takeScreenshot(): Promise<string>;
  options?: { specs?: string[] };
  [key: string]: unknown;
};
declare const browser: WdioBrowser;

// Narrows an unknown thrown value to a readable message string.
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error ?? '');
}

// .env may define these with a trailing newline/whitespace; Appium rejects the
// path as "does not exist" unless we trim it.
for (const name of ['ANDROID_HOME', 'ANDROID_SDK_ROOT']) {
  if (process.env[name]) {
    process.env[name] = process.env[name].trim();
  }
}

const androidUdid = process.env.APPIUM_UDID || 'emulator-5554';

// Best-effort adb call; failures are logged but never abort the run.
// No-op on iOS: adb is Android-only, so the Chrome reset hooks below simply skip on iOS Safari.
function adb(args: string[]): void {
  if (mobilePlatform !== 'android') {
    return;
  }

  const sdkRoot = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  const bin = process.platform === 'win32' ? 'adb.exe' : 'adb';
  const adbPath = sdkRoot ? path.join(sdkRoot, 'platform-tools', bin) : bin;

  try {
    execFileSync(adbPath, args, { stdio: 'ignore', timeout: 30000 });
  } catch (error) {
    console.log(`adb ${args.join(' ')} failed:`, errorMessage(error));
  }
}

// Android Chrome occasionally crashes its renderer/session mid-test on the
// emulator. Detect that and recover by relaunching a fresh session instead of
// failing the whole suite.
function isSessionLostError(error: unknown): boolean {
  return /invalid session id|browser has closed the connection|disconnected|chrome not reachable|unable to receive message from renderer/i.test(
    errorMessage(error),
  );
}

async function reloadMobileSession() {
  adb(['-s', androidUdid, 'shell', 'am', 'force-stop', 'com.android.chrome']);
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

  if (url.hostname.toLowerCase() === 'mattamyhomes.com') {
    url.hostname = 'www.mattamyhomes.com';
  }

  return url.toString().replace(/\/$/, '');
}

const appiumPort = Number(process.env.APPIUM_PORT || 4723);
const specLogDir = path.join(__dirname, 'log', 'wdio', 'spec-tests');
let specTestLogPath: string | undefined;

function getCurrentSpecPath(): string {
  const specArgIndex = process.argv.indexOf('--spec');
  const specFromArg = specArgIndex >= 0 ? process.argv[specArgIndex + 1] : '';
  const wdioBrowser = typeof browser === 'undefined' ? undefined : browser;
  const specFromBrowser = wdioBrowser?.options?.specs?.[0] || '';

  return specFromArg || specFromBrowser || 'mobile-web';
}

function getSpecTestLogPath() {
  if (specTestLogPath) {
    return specTestLogPath;
  }

  const specPath = getCurrentSpecPath();
  const specName = path.basename(specPath, path.extname(specPath)) || 'mobile-web';

  specTestLogPath = path.join(specLogDir, `${specName}.tests.log`);
  return specTestLogPath;
}

function cleanLogMessage(message: unknown): string {
  return String(message || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function addAllureMobileStep(message: string, status: Status = Status.PASSED): void {
  try {
    allureReporter.addStep(cleanLogMessage(message), undefined, status);
  } catch {
    // Allure context is not always available during early config hooks.
  }
}

function writeSpecTestLog(message: string, options: { allure?: boolean; status?: Status } = {}) {
  const cleanMessage = cleanLogMessage(message);

  // Echo every step to the console so the run is readable live, not just in the
  // per-spec log file. Opt out with MOBILE_LOG_CONSOLE=false.
  if (process.env.MOBILE_LOG_CONSOLE !== 'false') {
    console.log(cleanMessage);
  }

  try {
    fs.mkdirSync(specLogDir, { recursive: true });
    fs.appendFileSync(getSpecTestLogPath(), `${new Date().toISOString()} ${cleanMessage}\n`);
  } catch (error) {
    console.log('Unable to write spec test log:', errorMessage(error));
  }

  if (options.allure) {
    addAllureMobileStep(cleanMessage, options.status);
  }
}

// WDIO/Mocha test + hook objects are loosely shaped across framework versions;
// `any` here matches the permissive intent of the mobile layer.
function getTestTitle(test: any): string {
  if (typeof test?.fullTitle === 'function') {
    return test.fullTitle();
  }

  return test?.fullTitle || test?.title || test?.parent || 'Unnamed mobile test';
}

function getHookTitle(hook: any, hookName?: string): string {
  const title = getTestTitle(hook);
  return hookName ? `${hookName} ${title}` : title;
}

// Android Chrome capabilities (UiAutomator2). Chrome-specific options only apply here.
function buildAndroidCapabilities() {
  return {
    platformName: 'Android',
    browserName: 'Chrome',
    // "eager" returns control once the DOM is interactive instead of waiting
    // on every subresource, which keeps mobile navigation responsive.
    pageLoadStrategy: 'eager',

    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
    'appium:udid': androidUdid,

    // Start each session from a clean Chrome profile. Caching the profile was
    // slower in practice: Chrome restored the previous run's heavy tab and
    // stalled the renderer while loading the next page.
    'appium:noReset': false,

    'appium:autoGrantPermissions': true,
    // Match ChromeDriver to the device's Chrome version automatically.
    'appium:chromedriverAutodownload': true,

    'goog:chromeOptions': {
      androidPackage: 'com.android.chrome',
      // Start a fresh Chrome instance and skip the first-run/welcome screens
      // and popups that would otherwise block page navigation.
      androidUseRunningApp: false,
      args: [
        '--no-first-run',
        '--disable-fre',
        '--disable-popup-blocking',
        '--disable-notifications',
      ],
    },
  };
}

// iOS Safari capabilities (XCUITest). Requires macOS + Xcode + `appium driver install xcuitest`.
// Set APPIUM_DEVICE_NAME / APPIUM_PLATFORM_VERSION (and optionally APPIUM_UDID) to target a
// specific simulator or real device.
function buildIosCapabilities(): Record<string, unknown> {
  const capabilities: Record<string, unknown> = {
    platformName: 'iOS',
    browserName: 'Safari',

    'appium:automationName': 'XCUITest',
    'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'iPhone 15',
    'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION || '17.0',

    // Auto-dismiss Safari/system prompts that would otherwise block navigation.
    'appium:autoAcceptAlerts': true,
    'appium:safariInitialUrl': 'about:blank',
  };

  if (process.env.APPIUM_UDID) {
    capabilities['appium:udid'] = process.env.APPIUM_UDID;
  }

  return capabilities;
}

// One capability set per run, chosen by MOBILE_PLATFORM.
function buildCapabilities() {
  return [mobilePlatform === 'ios' ? buildIosCapabilities() : buildAndroidCapabilities()];
}

export const config = {
  runner: 'local',

  specs: [
    './tests/mobile/mobileWeb.home.spec.ts',
    './tests/mobile/mobileWeb.searchPage.spec.ts',
    './tests/mobile/mobileWeb.community.spec.ts',
    './tests/mobile/mobileWeb.market.spec.ts',
    './tests/mobile/mobileWeb.mpc.spec.ts',
    './tests/mobile/mobileWeb.plan.spec.ts',
    './tests/mobile/mobileWeb.qmi.spec.ts',
  ],

  maxInstances: 1,

  hostname: process.env.APPIUM_HOST || '127.0.0.1',
  port: appiumPort,
  path: '/',

  baseUrl: getMobileBaseUrl(),

  logLevel: process.env.WDIO_LOG_LEVEL || 'info',
  outputDir: './log/wdio',

  waitforTimeout: 30000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,

  framework: 'mocha',

  mochaOpts: {
    ui: 'bdd',
    timeout: 180000,
    // Retry once: an intermittent Chrome session crash on the emulator gets a
    // fresh session (via beforeTest) on the second attempt.
    retries: 1,
  },

  reporters: [
    [
      'allure',
      {
        outputDir: MOBILE_ALLURE_RESULTS_DIR,
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  services: [
    [
      'appium',
      {
        command: 'appium',
        args: { port: appiumPort, relaxedSecurity: true },
        logPath: './log/appium',
      },
    ],
  ],

  capabilities: buildCapabilities(),

  beforeSession: function () {
    // Stop Chrome and wipe its data so every Android run starts from a clean, fast slate
    // (no restored tabs, no stale cookies/cache). adb() is a no-op on iOS, where Appium's
    // fresh Safari session provides the clean slate instead.
    adb(['-s', androidUdid, 'shell', 'am', 'force-stop', 'com.android.chrome']);
    adb(['-s', androidUdid, 'shell', 'pm', 'clear', 'com.android.chrome']);
  },

  before: async function () {
    fs.mkdirSync(specLogDir, { recursive: true });
    fs.writeFileSync(
      getSpecTestLogPath(),
      `${new Date().toISOString()} SPEC START [${getMobilePlatformLabel()}] ${getCurrentSpecPath()}\n`,
    );
    const mobileSpecStep = (
      kind: string,
      message: string,
      status: Status = Status.PASSED,
    ): void => {
      writeSpecTestLog(`${kind} ${message}`, { allure: true, status });
    };
    (globalThis as Record<string, unknown>).__mobileSpecStep = mobileSpecStep;
    await browser.setTimeout({ implicit: 0, pageLoad: 60000, script: 60000 });
  },

  beforeTest: async function (test: any) {
    writeSpecTestLog(`TEST START ${getTestTitle(test)}`, { allure: true });
    await ensureMobileSession();
  },

  beforeHook: function (hook: any, _context: any, hookName?: string) {
    writeSpecTestLog(`ACTION HOOK START ${getHookTitle(hook, hookName)}`, { allure: true });
  },

  afterHook: function (hook: any, _context: any, result: any, hookName?: string) {
    const error = result?.error;
    writeSpecTestLog(
      error
        ? `FAIL HOOK ${getHookTitle(hook, hookName)} | ${cleanLogMessage(errorMessage(error)).slice(0, 1000)}`
        : `PASS HOOK ${getHookTitle(hook, hookName)}`,
      { allure: true, status: error ? Status.FAILED : Status.PASSED },
    );
  },

  afterTest: async function (test: any, _context: any, { error }: { error?: unknown }) {
    writeSpecTestLog(
      error
        ? `FAIL TEST ${getTestTitle(test)} | ${cleanLogMessage(errorMessage(error)).slice(0, 1000)}`
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
          'Failure screenshot',
          Buffer.from(screenshot, 'base64'),
          'image/png',
        );
      } catch (screenshotError) {
        console.log('Unable to capture failure screenshot:', errorMessage(screenshotError));
      }
    }
  },
};
