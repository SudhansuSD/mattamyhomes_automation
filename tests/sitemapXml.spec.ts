import {
    test,
    expect,
    Page,
    ConsoleMessage,
    Request,
    Response,
    APIRequestContext,
    APIResponse,
    TestInfo
} from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getEnvConfig } from '../config/envConfig';

type ValidationIssue = {
  url: string;
  kind: 'console' | 'response' | 'request' | 'redirect' | 'navigation';
  message: string;
};

type PageValidationResult = {
    sourceUrl: string;
    issues: ValidationIssue[];
    redirectedTo404: boolean;
    finalUrl: string;
    screenshotPath?: string;
};

const { envName } = getEnvConfig();

const SITEMAP_URLS = {
    STAGE: 'https://stagemh-sc.exsquared.com/sitemap.xml',
    PROD: 'https://mattamyhomes.com/sitemap.xml'
} as const;

const HTTP_ERROR_STATUS = 400;
const PAGE_LOAD_TIMEOUT = 90_000;
const SCROLL_STEP_PIXELS = 700;
const SCROLL_PAUSE_MS = 400;
const PAGE_SETTLE_MS = 800;
const SHORT_NETWORK_IDLE_TIMEOUT = 3000;
const MAX_SCROLL_PASSES = 8;
const MAX_SCROLL_STEPS_PER_PASS = 20;
const REPORT_FILE_NAME = 'sitemap_report.html';
const REPORT_ASSET_DIR = path.join('test-results', 'sitemap-report-assets');

function getSitemapUrl(): string {
    return envName === 'STAGE' ? SITEMAP_URLS.STAGE : SITEMAP_URLS.PROD;
}

function extractTagValues(xml: string, tagName: 'loc'): string[] {
    const pattern = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 'gis');
    const matches = Array.from(xml.matchAll(pattern));

    return matches
        .map((match) => match[1]?.trim())
        .filter((value): value is string => Boolean(value));
}

function normalizeUrl(url: string): string {
    return url.trim().replace(/\/+$/, '');
}

function normalizePath(pathname: string): string {
    return pathname.replace(/\/+$/, '') || '/';
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function toSafeFileName(url: string, index: number): string {
    const { hostname, pathname } = new URL(url);
    const normalizedPath = normalizePath(pathname)
        .replace(/\//g, '_')
        .replace(/[^a-zA-Z0-9_-]/g, '_');

    return `${String(index + 1).padStart(4, '0')}_${hostname}${normalizedPath}`;
}

function dedupeUrls(urls: string[]): string[] {
    return Array.from(new Set(urls.map(normalizeUrl)));
}

function isXmlResponse(contentType: string | null): boolean {
    return contentType?.toLowerCase().includes('xml') ?? false;
}

async function collectPageUrlsFromSitemap(
    request: APIRequestContext,
    sitemapUrl: string,
    visited = new Set<string>()
): Promise<string[]> {
    const normalizedSitemapUrl = normalizeUrl(sitemapUrl);

    if (visited.has(normalizedSitemapUrl)) {
        return [];
    }

    visited.add(normalizedSitemapUrl);

    const response: APIResponse = await request.get(sitemapUrl);
    expect(response.ok(), `Failed to load sitemap: ${sitemapUrl}`).toBeTruthy();

    const contentType = response.headers()['content-type'] ?? null;
    expect(
        isXmlResponse(contentType),
        `Expected XML response from sitemap ${sitemapUrl}, received: ${contentType ?? 'unknown'}`
    ).toBeTruthy();

    const xml = await response.text();
    const locs = extractTagValues(xml, 'loc');

    const childSitemapUrls = locs.filter((url) => url.toLowerCase().endsWith('.xml'));
    if (childSitemapUrls.length === 0) {
        return dedupeUrls(locs);
    }

    const nestedUrls = await Promise.all(
        childSitemapUrls.map((childSitemapUrl) =>
            collectPageUrlsFromSitemap(request, childSitemapUrl, visited)
        )
    );

    return dedupeUrls(nestedUrls.flat());
}

function buildConsoleIssue(url: string, message: ConsoleMessage): ValidationIssue {
    return {
        url,
        kind: 'console',
        message: `[Console ${message.type()}] ${message.text()}`
    };
}

function buildResponseIssue(response: Response): ValidationIssue {
    const request = response.request();
    return {
        url: response.url(),
        kind: 'response',
        message: `[HTTP ${response.status()} ${response.statusText()}] ${request.resourceType()} request to ${response.url()}`
    };
}

function buildRequestFailureIssue(url: string, request: Request): ValidationIssue {
  const failure = request.failure();
  return {
    url,
    kind: 'request',
    message: `[Request Failed] ${request.resourceType()} request to ${request.url()} failed with ${failure?.errorText ?? 'Unknown error'}`
  };
}

function buildNavigationIssue(targetUrl: string, error: unknown): ValidationIssue {
  const message = error instanceof Error ? error.message : String(error);
  return {
    url: targetUrl,
    kind: 'navigation',
    message: `[Navigation Failed] Unable to open ${targetUrl}. ${message}`
  };
}

function isAllowedFunctionalRedirect(sourceUrl: string, destinationUrl: string): boolean {
    const source = new URL(sourceUrl);
    const destination = new URL(destinationUrl);

    return (
        source.origin === destination.origin &&
        normalizePath(source.pathname) === normalizePath(destination.pathname)
    );
}

function is404Path(url: string): boolean {
    return normalizePath(new URL(url).pathname) === '/404';
}

async function waitForPageToSettle(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded', { timeout: PAGE_LOAD_TIMEOUT });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => undefined);
    await page.waitForTimeout(PAGE_SETTLE_MS);
}

async function captureFailureScreenshot(
    page: Page,
    targetUrl: string,
    index: number
): Promise<string | undefined> {
    try {
        await mkdir(REPORT_ASSET_DIR, { recursive: true });
        const screenshotFileName = `${toSafeFileName(targetUrl, index)}.png`;
        const screenshotPath = path.join(REPORT_ASSET_DIR, screenshotFileName);

        await page.screenshot({
            path: screenshotPath,
            fullPage: true
        });

        return screenshotPath.replace(/\\/g, '/');
    } catch {
        return undefined;
    }
}

async function validatePageUrl(page: Page, targetUrl: string): Promise<PageValidationResult> {
  const issues: ValidationIssue[] = [];

    const onConsole = (message: ConsoleMessage) => {
        if (message.type() === 'error') {
            issues.push(buildConsoleIssue(targetUrl, message));
        }
    };

    const onResponse = (response: Response) => {
        const resourceType = response.request().resourceType();
        if ((resourceType === 'xhr' || resourceType === 'fetch') && response.status() >= HTTP_ERROR_STATUS) {
            issues.push(buildResponseIssue(response));
        }
    };

    const onRequestFailed = (request: Request) => {
        const resourceType = request.resourceType();
        if (resourceType === 'xhr' || resourceType === 'fetch') {
            issues.push(buildRequestFailureIssue(targetUrl, request));
        }
    };

  page.on('console', onConsole);
  page.on('response', onResponse);
  page.on('requestfailed', onRequestFailed);

  try {
    let response: Response | null = null;

    try {
      response = await page.goto(targetUrl, {
        waitUntil: 'domcontentloaded',
        timeout: PAGE_LOAD_TIMEOUT
      });
    } catch (error) {
      issues.push(buildNavigationIssue(targetUrl, error));

      return {
        sourceUrl: targetUrl,
        issues,
        redirectedTo404: false,
        finalUrl: page.url() || targetUrl
      };
    }

    expect(response, `No navigation response received for ${targetUrl}`).not.toBeNull();

        if (response) {
            const resourceType = response.request().resourceType();
            if ((resourceType === 'xhr' || resourceType === 'fetch') && response.status() >= HTTP_ERROR_STATUS) {
                issues.push(buildResponseIssue(response));
            }
        }

        await waitForPageToSettle(page);
        await scrollPageTopToBottom(page);
        await waitForPageToSettle(page);

        const finalUrl = page.url();
        if (
            normalizeUrl(finalUrl) !== normalizeUrl(targetUrl) &&
            !isAllowedFunctionalRedirect(targetUrl, finalUrl)
        ) {
            issues.push({
                url: targetUrl,
                kind: 'redirect',
                message: `Unexpected redirect to ${finalUrl}`
            });
        }

        return {
            sourceUrl: targetUrl,
            issues,
            redirectedTo404: is404Path(finalUrl),
            finalUrl
        };
    } finally {
        page.off('console', onConsole);
        page.off('response', onResponse);
        page.off('requestfailed', onRequestFailed);
    }
}

async function scrollPageTopToBottom(page: Page): Promise<void> {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(SCROLL_PAUSE_MS);

    let previousHeight = -1;

    for (let pass = 0; pass < MAX_SCROLL_PASSES; pass++) {
        const metrics = await page.evaluate(() => {
            const body = document.body;
            const documentElement = document.documentElement;

            const totalHeight = Math.max(
                body.scrollHeight,
                body.offsetHeight,
                documentElement.clientHeight,
                documentElement.scrollHeight,
                documentElement.offsetHeight
            );

            return {
                totalHeight,
                viewportHeight: window.innerHeight,
                scrollY: window.scrollY
            };
        });

        if (metrics.totalHeight === previousHeight &&
            metrics.scrollY + metrics.viewportHeight >= metrics.totalHeight - 5) {
            break;
        }

        previousHeight = metrics.totalHeight;

        let currentPosition = metrics.scrollY;
        let stepCount = 0;

        while (
            currentPosition + metrics.viewportHeight < metrics.totalHeight &&
            stepCount < MAX_SCROLL_STEPS_PER_PASS
        ) {
            currentPosition = Math.min(
                currentPosition + SCROLL_STEP_PIXELS,
                Math.max(metrics.totalHeight - metrics.viewportHeight, 0)
            );

            await page.mouse.wheel(0, SCROLL_STEP_PIXELS);
            await page.evaluate((scrollY) => window.scrollTo(0, scrollY), currentPosition);
            await page.waitForTimeout(SCROLL_PAUSE_MS);
            stepCount += 1;
        }

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(SCROLL_PAUSE_MS);

        const refreshedMetrics = await page.evaluate(() => {
            const body = document.body;
            const documentElement = document.documentElement;

            return {
                totalHeight: Math.max(
                    body.scrollHeight,
                    body.offsetHeight,
                    documentElement.clientHeight,
                    documentElement.scrollHeight,
                    documentElement.offsetHeight
                ),
                scrollY: window.scrollY,
                viewportHeight: window.innerHeight
            };
        });

        await page.waitForLoadState('networkidle', { timeout: SHORT_NETWORK_IDLE_TIMEOUT }).catch(() => undefined);

        const reachedBottom =
            refreshedMetrics.scrollY + refreshedMetrics.viewportHeight >= refreshedMetrics.totalHeight - 5;

        if (reachedBottom && refreshedMetrics.totalHeight === previousHeight) {
            break;
        }
    }
}

function formatIssuesForReport(issues: ValidationIssue[]): string {
  return issues
    .map((issue) => {
      const summary = escapeHtml(describeIssue(issue));
      const rawMessage = escapeHtml(issue.message);

      return `
        <li>
          <strong>${escapeHtml(issue.kind.toUpperCase())}</strong>: ${summary}
          <div class="issue-detail">${rawMessage}</div>
        </li>
      `;
    })
    .join('\n');
}

function formatFailureSummary(results: PageValidationResult[]): string {
    const failedResults = results.filter((result) => result.issues.length > 0);

    if (failedResults.length === 0) {
        return '';
    }

  return failedResults
    .map((result, index) => {
      const issueLines = result.issues
        .map(
          (issue, issueIndex) =>
            `  ${issueIndex + 1}. ${issue.kind.toUpperCase()}: ${describeIssue(issue)} | Raw: ${issue.message}`
        )
        .join('\n');

            return [
                `${index + 1}. Source URL: ${result.sourceUrl}`,
                `   Final URL: ${result.finalUrl}`,
                issueLines
            ].join('\n');
        })
    .join('\n\n');
}

function describeIssue(issue: ValidationIssue): string {
  if (
    issue.kind === 'console' &&
    issue.message.includes('sandboxed') &&
    issue.message.includes('allow-scripts')
  ) {
    return 'A sandboxed iframe tried to execute scripts and the browser blocked it.';
  }

  if (issue.kind === 'console') {
    return 'The page emitted a browser console error while loading or rendering.';
  }

  if (issue.kind === 'response') {
    const match = issue.message.match(/\[HTTP\s+(\d+)\s+([^\]]+)\]\s+(\w+)\s+request\s+to\s+(.+)/i);
    if (match) {
      const [, status, statusText, resourceType, url] = match;
      return `A ${resourceType.toUpperCase()} request returned ${status} ${statusText} for ${url}.`;
    }
    return 'A network request returned a failed HTTP status.';
  }

  if (issue.kind === 'request') {
    const match = issue.message.match(/\[Request Failed\]\s+(\w+)\s+request\s+to\s+(.+?)\s+failed\s+with\s+(.+)/i);
    if (match) {
      const [, resourceType, url, reason] = match;
      return `A ${resourceType.toUpperCase()} request failed to complete for ${url}. Browser reason: ${reason}.`;
    }
    return 'A network request could not be completed by the browser.';
  }

  if (issue.kind === 'redirect') {
    return 'The page ended on a different URL than expected.';
  }

  if (issue.kind === 'navigation') {
    return 'The browser could not finish opening this URL.';
  }

  return issue.message;
}

function buildReportHtml(
    sitemapUrl: string,
    results: PageValidationResult[],
    redirectedTo404Urls: Array<{ sourceUrl: string; finalUrl: string }>
): string {
    const totalUrls = results.length;
    const failureResults = results.filter((result) => result.issues.length > 0);
    const passedResults = results.filter((result) => result.issues.length === 0);
    const successCount = passedResults.length;
    const failureCount = failureResults.length;

    const passedUrlMarkup = passedResults.length > 0
        ? passedResults
            .map(
                (result, index) => `
            <li>
              <strong>${index + 1}.</strong>
              <a href="${escapeHtml(result.sourceUrl)}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(result.sourceUrl)}
              </a>
            </li>`
            )
            .join('\n')
        : '<li>None</li>';

    const failedUrlMarkup = failureResults.length > 0
        ? failureResults
            .map(
                (result, index) => `
            <li>
              <strong>${index + 1}.</strong>
              <a href="${escapeHtml(result.sourceUrl)}" target="_blank" rel="noopener noreferrer">
                ${escapeHtml(result.sourceUrl)}
              </a>
            </li>`
            )
            .join('\n')
        : '<li>None</li>';

    const redirected404Markup = redirectedTo404Urls.length > 0
        ? redirectedTo404Urls
            .map(
                (redirect, index) =>
                    `<li>${index + 1}. ${escapeHtml(redirect.sourceUrl)} -> ${escapeHtml(redirect.finalUrl)}</li>`
            )
            .join('\n')
        : '<li>None</li>';

    const failedDetailsMarkup = failureResults.length > 0
        ? failureResults
            .map((result, index) => {
                const screenshotMarkup = result.screenshotPath
                    ? `<p><a href="${escapeHtml(result.screenshotPath)}" target="_blank" rel="noopener noreferrer">Open screenshot</a></p>
               <img src="${escapeHtml(result.screenshotPath)}" alt="Screenshot for ${escapeHtml(result.sourceUrl)}" />`
                    : '<p>Screenshot unavailable.</p>';

                return `
            <section class="card failure">
              <h3>${index + 1}. 
                <a href="${escapeHtml(result.sourceUrl)}" target="_blank" rel="noopener noreferrer">
                  ${escapeHtml(result.sourceUrl)}
                </a>
              </h3>
              <p><strong>Final URL:</strong> ${escapeHtml(result.finalUrl)}</p>
              <p><strong>Status:</strong> Failed</p>
              <ul>${formatIssuesForReport(result.issues)}</ul>
              ${screenshotMarkup}
            </section>
          `;
            })
            .join('\n')
        : '<section class="card success"><h3>No failed URLs</h3><p>All sitemap URLs passed validation.</p></section>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sitemap Report</title>
  <style>
    :root {
      --bg: #f4efe6;
      --panel: rgba(255, 252, 246, 0.92);
      --panel-strong: #fffdf9;
      --text: #1f2933;
      --muted: #5f6c7b;
      --border: rgba(154, 126, 83, 0.18);
      --danger: #b42318;
      --warning: #b54708;
      --success: #157347;
      --link: #0b63ce;
      --hero-start: #f8f1e3;
      --hero-end: #e9dcc1;
      --shadow: 0 18px 42px rgba(31, 41, 51, 0.10);
    }
    body {
      margin: 0;
      padding: 32px;
      background:
        radial-gradient(circle at top left, rgba(255,255,255,0.6), transparent 28%),
        linear-gradient(180deg, #f8f4ea 0%, #ece4d5 100%);
      color: var(--text);
      font-family: "Segoe UI", Tahoma, sans-serif;
    }
    main {
      max-width: 1240px;
      margin: 0 auto;
    }
    .hero, .card {
      background: var(--panel);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border);
      border-radius: 22px;
      box-shadow: var(--shadow);
    }
    .hero {
      padding: 28px;
      margin-bottom: 24px;
      background: linear-gradient(135deg, var(--hero-start) 0%, var(--hero-end) 100%);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 14px;
      margin-top: 22px;
    }
    .stat {
      padding: 18px;
      border-radius: 16px;
      border: 1px solid rgba(154, 126, 83, 0.14);
      background: rgba(255, 255, 255, 0.55);
    }
    .stat strong {
      display: block;
      font-size: 32px;
      margin-bottom: 6px;
    }
    .section {
      display: grid;
      gap: 22px;
      margin-bottom: 24px;
    }
    .card {
      padding: 22px;
    }
    .card h2 {
      margin-top: 0;
      margin-bottom: 16px;
      font-size: 1.3rem;
    }
    .failure h3 {
      color: var(--danger);
    }
    .warning h2 {
      color: var(--warning);
    }
    .success h3 {
      color: var(--success);
    }
    img {
      display: block;
      margin-top: 14px;
      max-width: 100%;
      border-radius: 16px;
      border: 1px solid var(--border);
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 8px;
      line-height: 1.5;
      word-break: break-word;
    }
    .issue-detail {
      margin-top: 6px;
      color: var(--muted);
      font-size: 0.92rem;
      word-break: break-word;
    }
    a {
      color: var(--link);
      text-decoration: none;
      font-weight: 600;
    }
    a:hover {
      text-decoration: underline;
    }
    code {
      background: rgba(255,255,255,0.72);
      padding: 4px 8px;
      border-radius: 6px;
    }
    .muted {
      color: var(--muted);
    }
  </style>
</head>
<body>
  <main>
    <section class="hero">
      <h1>Sitemap Validation Report</h1>
      <p><strong>Sitemap:</strong> <code>${escapeHtml(sitemapUrl)}</code></p>

      <div class="stats">
        <div class="stat">
          <strong>${totalUrls}</strong>
          <span>Total URLs Checked</span>
        </div>
        <div class="stat">
          <strong>${successCount}</strong>
          <span>Passed URLs</span>
        </div>
        <div class="stat">
          <strong>${failureCount}</strong>
          <span>Failed URLs</span>
        </div>
        <div class="stat">
          <strong>${redirectedTo404Urls.length}</strong>
          <span>Redirected to /404</span>
        </div>
      </div>
    </section>

    <section class="section">
      <section class="card success">
        <h2>Passed URL List</h2>
        <ul>
          ${passedUrlMarkup}
        </ul>
      </section>

      <section class="card failure">
        <h2>Failed URL List</h2>
        <ul>
          ${failedUrlMarkup}
        </ul>
      </section>

      <section class="card warning">
        <h2>Redirected To /404</h2>
        <ul>
          ${redirected404Markup}
        </ul>
      </section>

      <section class="card">
        <h2>Failed URL Details</h2>
        ${failedDetailsMarkup}
      </section>
    </section>
  </main>
</body>
</html>`;
}
async function writeSitemapReport(
    sitemapUrl: string,
    results: PageValidationResult[],
    redirectedTo404Urls: Array<{ sourceUrl: string; finalUrl: string }>
): Promise<void> {
    const reportPath = path.join(process.cwd(), REPORT_FILE_NAME);
    const reportHtml = buildReportHtml(sitemapUrl, results, redirectedTo404Urls);
    await writeFile(reportPath, reportHtml, 'utf-8');
}

test.describe('Sitemap XML validation', () => {
    test('@regression Validate all sitemap URLs are healthy', async ({ page, request }, testInfo: TestInfo) => {
        test.setTimeout(100 * 60 * 1000);

        const sitemapUrl = getSitemapUrl();
        const pageUrls = await collectPageUrlsFromSitemap(request, sitemapUrl);

        expect(pageUrls.length, `No URLs found in sitemap ${sitemapUrl}`).toBeGreaterThan(0);

        const pageResults: PageValidationResult[] = [];
        const redirectedTo404Urls: Array<{ sourceUrl: string; finalUrl: string }> = [];

        try {
            for (const [index, pageUrl] of pageUrls.entries()) {
                await test.step(`Validate sitemap URL ${index + 1}/${pageUrls.length}: ${pageUrl}`, async () => {
                    const validationPage = await page.context().newPage();
                    let result: PageValidationResult;

                    try {
                        result = await validatePageUrl(validationPage, pageUrl);

                        if (result.issues.length > 0) {
                            result.screenshotPath = await captureFailureScreenshot(validationPage, pageUrl, index);
                        }
                    } finally {
                        await validationPage.close().catch(() => undefined);
                    }

                    pageResults.push(result);

                    if (result.redirectedTo404) {
                        redirectedTo404Urls.push({
                            sourceUrl: pageUrl,
                            finalUrl: result.finalUrl
                        });
                    }

                    await testInfo.attach(`page-result-${index + 1}.json`, {
                        body: Buffer.from(JSON.stringify(result, null, 2), 'utf-8'),
                        contentType: 'application/json'
                    });

                    if (result.issues.length > 0) {
                        await testInfo.attach(`page-errors-${index + 1}.txt`, {
                            body: Buffer.from(
                                [
                                    `Source URL: ${result.sourceUrl}`,
                                    `Final URL: ${result.finalUrl}`,
                                    '',
                                    ...result.issues.map(
                                        (issue, issueIndex) => `${issueIndex + 1}. ${issue.kind.toUpperCase()}: ${issue.message}`
                                    )
                                ].join('\n'),
                                'utf-8'
                            ),
                            contentType: 'text/plain'
                        });
                    }
                });
            }
        } finally {
            await writeSitemapReport(sitemapUrl, pageResults, redirectedTo404Urls);
            await testInfo.attach('sitemap-report-path.txt', {
                body: Buffer.from(path.join(process.cwd(), REPORT_FILE_NAME), 'utf-8'),
                contentType: 'text/plain'
            });
        }

        if (redirectedTo404Urls.length > 0) {
            console.log('URLs redirected to /404:');
            for (const redirect of redirectedTo404Urls) {
                console.log(`${redirect.sourceUrl} -> ${redirect.finalUrl}`);
            }
        }

        expect(pageResults.filter((result) => result.issues.length > 0), formatFailureSummary(pageResults)).toEqual([]);
    });
});
