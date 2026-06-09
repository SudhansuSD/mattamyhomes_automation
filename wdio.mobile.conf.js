require("dotenv").config();
require("ts-node/register/transpile-only");

const allureReporter = require("@wdio/allure-reporter").default;
const { getEnvConfig } = require("./config/environments/envConfig");

if (process.env.ANDROID_HOME) {
  process.env.ANDROID_HOME = process.env.ANDROID_HOME.trim();
}

if (process.env.ANDROID_SDK_ROOT) {
  process.env.ANDROID_SDK_ROOT = process.env.ANDROID_SDK_ROOT.trim();
}

function getMobileBaseUrl() {
  const configuredUrl =
    process.env.MOBILE_BASE_URL ||
    process.env.APPIUM_BASE_URL ||
    getEnvConfig().baseURL;

  const url = new URL(configuredUrl);

  if (url.hostname.toLowerCase() === "mattamyhomes.com") {
    url.hostname = "www.mattamyhomes.com";
  }

  return url.toString().replace(/\/$/, "");
}

function getConfiguredAppiumPort() {
  const port = Number(process.env.APPIUM_PORT || 4725);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(
      `APPIUM_PORT must be a positive integer. Received: ${process.env.APPIUM_PORT}`,
    );
  }

  return port;
}

const configuredAppiumPort = getConfiguredAppiumPort();

const appiumConnection = {
  hostname: process.env.APPIUM_HOST || "127.0.0.1",
  port: configuredAppiumPort,
  path: "/",
};

const appiumArgs = {
  port: configuredAppiumPort,
  allowInsecure: "uiautomator2:chromedriver_autodownload",
  relaxedSecurity: true,
};

const androidCapability = {
  maxInstances: 1,

  platformName: "Android",
  browserName: "Chrome",

  "appium:automationName": "UiAutomator2",

  "appium:deviceName":
    process.env.APPIUM_DEVICE_NAME ||
    process.env.MOBILE_DEVICE_NAME ||
    "Android Emulator",

  "appium:udid": process.env.APPIUM_UDID || "emulator-5554",

  /**
   * Use clean Chrome session.
   * This is important because your device Chrome is crashing/blanking.
   */
  "appium:noReset": false,

  "appium:autoGrantPermissions": true,
  "appium:disableWindowAnimation": true,
  "appium:newCommandTimeout": Number(
    process.env.APPIUM_NEW_COMMAND_TIMEOUT || 180,
  ),

  /**
   * Required to avoid ChromeDriver mismatch with device Chrome version.
   */
  "appium:chromedriverAutodownload": true,

  /**
   * Keep Android Chrome options minimal.
   * Too many desktop Chrome flags can make Android Chrome unstable.
   */
  "goog:chromeOptions": {
    androidUseRunningApp: false,
    args: [
      "--disable-fre",
      "--disable-popup-blocking",
      "--disable-notifications",
    ],
  },
};

if (process.env.APPIUM_PLATFORM_VERSION) {
  androidCapability["appium:platformVersion"] =
    process.env.APPIUM_PLATFORM_VERSION;
}

exports.config = {
  runner: "local",

  specs: ["./tests/mobile/**/*.spec.js"],

  maxInstances: 1,

  ...appiumConnection,

  baseUrl: getMobileBaseUrl(),

  logLevel: process.env.WDIO_LOG_LEVEL || "info",
  outputDir: "./log/wdio",

  waitforTimeout: Number(process.env.WDIO_WAIT_TIMEOUT || 30000),
  connectionRetryTimeout: Number(
    process.env.WDIO_CONNECTION_RETRY_TIMEOUT || 120000,
  ),
  connectionRetryCount: Number(process.env.WDIO_CONNECTION_RETRY_COUNT || 3),

  specFileRetries: Number(process.env.WDIO_SPEC_FILE_RETRIES || 0),
  specFileRetriesDelay: Number(process.env.WDIO_SPEC_FILE_RETRIES_DELAY || 5),

  framework: "mocha",

  reporters: [
    [
      "allure",
      {
        outputDir: "allure-results",
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
      },
    ],
  ],

  mochaOpts: {
    ui: "bdd",
    timeout: Number(process.env.WDIO_MOCHA_TIMEOUT || 180000),

    /**
     * Retry once for mobile instability.
     */
    retries: Number(process.env.WDIO_MOCHA_RETRIES || 1),
  },

  services: [
    [
      "appium",
      {
        command: "appium",
        args: appiumArgs,
        logPath: "./log/appium",
      },
    ],
  ],

  capabilities: [androidCapability],

  beforeSession: function () {
    console.log("========================================");
    console.log("Starting Android Chrome Mobile Session");
    console.log("Mobile Base URL:", getMobileBaseUrl());
    console.log("Appium Host:", appiumConnection.hostname);
    console.log("Appium Port:", configuredAppiumPort);
    console.log("Android Device:", androidCapability["appium:deviceName"]);
    console.log("Android UDID:", androidCapability["appium:udid"]);
    console.log("noReset:", androidCapability["appium:noReset"]);
    console.log("========================================");
  },

  before: async function () {
    try {
      await browser.setTimeout({
        implicit: 0,
        pageLoad: 60000,
        script: 60000,
      });
    } catch (error) {
      console.log("Unable to set browser timeouts:", error.message);
    }
  },

  beforeTest: async function () {
    try {
      if (browser.sessionId) {
        await browser.getUrl();
      }
    } catch (error) {
      console.log("Browser session not active before test:", error.message);
    }
  },

  afterTest: async function (test, context, { error }) {
    if (error) {
      try {
        if (browser.sessionId) {
          const screenshot = await browser.takeScreenshot();
          allureReporter.addAttachment(
            "Failure screenshot",
            Buffer.from(screenshot, "base64"),
            "image/png",
          );
        }
      } catch (screenshotError) {
        console.log(
          "Unable to capture failure screenshot:",
          screenshotError.message,
        );
      }
    }

    /**
     * Clear cookies only if session is alive.
     * Do not reload session here because it can make Android Chrome more unstable.
     */
    try {
      if (browser.sessionId) {
        await browser.deleteCookies();
      }
    } catch (cookieError) {
      console.log("Unable to clear cookies after test:", cookieError.message);
    }
  },

  afterSession: function () {
    console.log("Android mobile Chrome session completed.");
  },
};
