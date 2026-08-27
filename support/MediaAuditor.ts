import { expect, Page, test } from '@playwright/test';

/** Checks that every image and video a page references actually resolves. */
export type MediaAuditorDeps = {
  report: (message: string, value?: unknown) => Promise<void>;
  waitForPageReady: () => Promise<void>;
  dismissPromoPopup: (options?: { appearTimeout?: number }) => Promise<void>;
};

export class MediaAuditor {
  private readonly page: Page;
  private readonly deps: MediaAuditorDeps;

  /** Sets up the media auditor for one page. */
  constructor(page: Page, deps: MediaAuditorDeps) {
    this.page = page;
    this.deps = deps;
  }

  /** Checks that image and video URLs return HTTP 200. */
  async validateAllMediaReturns200(pageName: string): Promise<void> {
    await test.step(`Validate image and video URLs return 200 on ${pageName}`, async () => {
      await this.deps.waitForPageReady();
      await this.deps.dismissPromoPopup();
      await this.loadLazyMedia();
      await this.deps.dismissPromoPopup();

      const mediaUrls = await this.collectImageAndVideoUrls();

      expect(mediaUrls.length, `${pageName} should expose image or video URLs`).toBeGreaterThan(0);

      await this.deps.report(`${pageName}: checking ${mediaUrls.length} media URL(s)`);

      const failures: string[] = [];
      const warnings: string[] = [];

      for (const media of mediaUrls) {
        const status = await this.getMediaUrlStatus(media.url);

        await this.deps.report(`[${status}] ${media.type} | ${media.label}`, media.url);

        if (status === 200) {
          continue;
        }

        const detail = `${media.type} returned ${status} for ${media.label}: ${media.url}`;

        if (isContentPlaceholder(media.url, media.label)) {
          warnings.push(detail);
        } else {
          failures.push(detail);
        }
      }

      if (warnings.length) {
        const summary = warnings.join('\n');

        // Surfaced, not swallowed: attached so it shows in the Allure report and
        // marked in stdout so a CI log search can count it.
        console.warn(`[media-warning] ${pageName}: ${summary}`);
        await test.info().attach(`placeholder-warnings-${pageName}`, {
          body: summary,
          contentType: 'text/plain',
        });
        await this.deps.report(
          `${pageName}: ${warnings.length} placeholder asset warning(s) - reported, not failed`,
        );
      }

      expect(
        failures,
        `${pageName} image/video URL status failures:\n${failures.join('\n')}`,
      ).toHaveLength(0);
    });
  }

  /** Loads lazy media. */
  private async loadLazyMedia(): Promise<void> {
    await this.page.evaluate(async () => {
      const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
      const viewportStep = Math.max(window.innerHeight || 800, 600);
      const pageHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
      );

      for (let y = 0; y <= pageHeight; y += viewportStep) {
        window.scrollTo(0, y);
        await delay(250);
      }

      window.scrollTo(0, 0);
    });

    await this.deps.waitForPageReady();
  }

  /** Collects image and video URLs. */
  private async collectImageAndVideoUrls(): Promise<
    Array<{ type: string; label: string; url: string }>
  > {
    const rawUrls = await this.page.evaluate(() => {
      const media: Array<{ type: string; label: string; url: string }> = [];
      const cleanText = (value: string | null | undefined) =>
        (value || '').replace(/\s+/g, ' ').trim();
      const getSectionLabel = (element: Element): string => {
        const directLabel =
          cleanText(element.getAttribute('alt')) ||
          cleanText(element.getAttribute('aria-label')) ||
          cleanText(element.getAttribute('title'));

        if (directLabel) return directLabel;

        const figure = element.closest('figure');
        const caption = figure?.querySelector('figcaption');
        const captionText = cleanText(caption?.textContent);

        if (captionText) return captionText;

        const section = element.closest(
          'section, article, main, header, footer, [role="region"], [aria-label]',
        );
        const sectionAria = cleanText(section?.getAttribute('aria-label'));

        if (sectionAria) return sectionAria;

        const heading = section?.querySelector('h1, h2, h3, h4, h5, h6');
        const headingText = cleanText(heading?.textContent);

        if (headingText) return headingText;

        const link = element.closest('a');
        const linkLabel =
          cleanText(link?.getAttribute('aria-label')) || cleanText(link?.textContent);

        return linkLabel || 'No alt/section label';
      };
      const addUrl = (type: string, rawUrl: string | null | undefined, element: Element) => {
        if (!rawUrl) return;

        const trimmed = rawUrl.trim();

        if (
          !trimmed ||
          /^(data|blob|javascript|about):/i.test(trimmed) ||
          /\/\/(?:bat\.bing\.com|www\.google-analytics\.com|googleads\.g\.doubleclick\.net|connect\.facebook\.net|static\.hotjar\.com|script\.hotjar\.com)\//i.test(
            trimmed,
          )
        ) {
          return;
        }

        try {
          media.push({
            type,
            label: getSectionLabel(element),
            url: new URL(trimmed, window.location.href).href,
          });
        } catch {
          // Ignore malformed media attributes.
        }
      };

      const addSrcset = (type: string, srcset: string | null | undefined, element: Element) => {
        if (!srcset) return;

        for (const candidate of srcset.split(',')) {
          addUrl(type, candidate.trim().split(/\s+/)[0], element);
        }
      };

      document.querySelectorAll('img').forEach((image) => {
        const img = image as HTMLImageElement;
        addUrl('image', img.currentSrc || img.src || img.getAttribute('src'), img);
        addSrcset('image', img.getAttribute('srcset'), img);
      });

      document.querySelectorAll('picture source').forEach((source) => {
        addUrl('image-source', source.getAttribute('src'), source);
        addSrcset('image-source', source.getAttribute('srcset'), source);
      });

      document.querySelectorAll('video').forEach((video) => {
        const mediaElement = video as HTMLVideoElement;
        addUrl(
          'video',
          mediaElement.currentSrc || mediaElement.src || mediaElement.getAttribute('src'),
          mediaElement,
        );
        addUrl(
          'video-poster',
          mediaElement.poster || mediaElement.getAttribute('poster'),
          mediaElement,
        );
      });

      document.querySelectorAll('video source').forEach((source) => {
        addUrl('video-source', source.getAttribute('src'), source);
        addSrcset('video-source', source.getAttribute('srcset'), source);
      });

      return media;
    });

    const unique = new Map<string, { type: string; label: string; url: string }>();

    for (const item of rawUrls) {
      if (this.isIgnorableMediaUrl(item.url)) {
        continue;
      }

      if (!unique.has(item.url)) {
        unique.set(item.url, item);
      }
    }

    return [...unique.values()];
  }

  /** Checks whether ignorable media URL. */
  private isIgnorableMediaUrl(url: string): boolean {
    return /\/\/(?:bat\.bing\.com|www\.google-analytics\.com|googleads\.g\.doubleclick\.net|connect\.facebook\.net|static\.hotjar\.com|script\.hotjar\.com)\//i.test(
      url,
    );
  }

  /** Gets the HTTP status for a media URL. */
  private async getMediaUrlStatus(url: string): Promise<number | string> {
    const headResponse = await this.page.request
      .head(url, {
        failOnStatusCode: false,
        timeout: 30_000,
      })
      .catch(() => null);

    if (headResponse && ![403, 405, 501].includes(headResponse.status())) {
      return headResponse.status();
    }

    const getResponse = await this.page.request
      .get(url, {
        failOnStatusCode: false,
        timeout: 30_000,
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : String(error);
        return { status: () => `request failed: ${message}` };
      });

    return getResponse.status();
  }
}

/**
 * CMS placeholders rather than page content.
 *
 * "Image Coming Soon" is what the site serves before a real photo is uploaded.
 * If that placeholder 404s it is a content/CDN issue, so it is reported as a
 * warning. Genuine page content still fails the test.
 */
function isContentPlaceholder(url: string, label: string): boolean {
  return /image[-_ ]?coming[-_ ]?soon|placeholder|no[-_ ]?image[-_ ]?available/i.test(
    `${url} ${label}`,
  );
}
