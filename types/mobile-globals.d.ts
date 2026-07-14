// Ambient declarations for the browser- and Node-side globals the mobile suite
// installs at runtime.
//
// - The `__getVisible*` functions are injected into the page by
//   utils/mobileLeadFormHelper (installVisibleLeadFormFinder) and then called
//   from inside `driver.execute()` browser callbacks.
// - `__mobileSpecStep` is set on the Node globalThis by the WDIO `before` hook so
//   page objects can route step logs into the per-spec log + Allure.

export {};

declare global {
  interface Window {
    __getVisibleMarketLeadForms?: () => HTMLElement[];
    __getVisibleMpcLeadForms?: () => HTMLElement[];
    __getVisiblePlanForms?: () => HTMLElement[];
    __getVisibleQmiForms?: () => HTMLElement[];
    __getVisibleCommunityForms?: () => HTMLElement[];
  }

  // eslint-disable-next-line no-var
  var __mobileSpecStep:
    | ((kind: string, message: string, status?: unknown) => void)
    | undefined;

  /**
   * Permissive structural view of the WebdriverIO Browser used as the mobile page
   * objects' `driver`. `execute`/`waitUntil` return `any` so the many
   * `driver.execute()` browser-context callbacks are not reshaped by WDIO's
   * InnerArguments/TransformReturn generics (which otherwise retype callback args
   * and results as HTMLElement). The `[key: string]: any` fallback keeps the full
   * Browser surface reachable without re-declaring it here.
   */
  type MobileBrowser = {
    execute(script: (...args: any[]) => any, ...args: any[]): Promise<any>;
    pause(ms: number): Promise<void>;
    getUrl(): Promise<string>;
    url(url?: string): Promise<unknown>;
    back(): Promise<void>;
    keys(value: string | string[]): Promise<void>;
    waitUntil(
      condition: () => boolean | Promise<boolean>,
      options?: { timeout?: number; timeoutMsg?: string; interval?: number }
    ): Promise<unknown>;
    getWindowSize(): Promise<{ width: number; height: number }>;
    reloadSession(...args: any[]): Promise<unknown>;
    setTimeout(timeouts: {
      implicit?: number;
      pageLoad?: number;
      script?: number;
    }): Promise<void>;
    takeScreenshot(): Promise<string>;
    sessionId: string;
    options: any;
    [key: string]: any;
  };
}
