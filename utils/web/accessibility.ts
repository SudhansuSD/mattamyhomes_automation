import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

// WCAG scanning; fails on serious/critical only, since minor/moderate findings number in the hundreds.

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

export type AccessibilityScanOptions = {
  /** CSS selectors to exclude - third-party embeds we do not control. */
  exclude?: string[];
  /** Rule ids to skip. */
  disableRules?: string[];
  /** Also fail on moderate findings. */
  includeModerate?: boolean;
};

/** Scans the page, attaches violation details, and fails on serious/critical violations. */
export async function expectNoAccessibilityViolations(
  page: Page,
  pageName: string,
  options: AccessibilityScanOptions = {},
): Promise<void> {
  await test.step(`Accessibility scan: ${pageName}`, async () => {
    let builder = new AxeBuilder({ page }).withTags(DEFAULT_TAGS);

    // Exclude third-party iframes and banners we cannot fix.
    const excluded = [
      'iframe',
      '#onetrust-banner-sdk',
      '[aria-label*="promotion" i]',
      ...(options.exclude ?? []),
    ];

    for (const selector of excluded) {
      builder = builder.exclude(selector);
    }

    if (options.disableRules?.length) {
      builder = builder.disableRules(options.disableRules);
    }

    const results = await builder.analyze();

    const blocking = options.includeModerate
      ? new Set([...BLOCKING_IMPACTS, 'moderate'])
      : BLOCKING_IMPACTS;

    const violations = results.violations.filter(
      (violation) => violation.impact && blocking.has(violation.impact),
    );

    if (violations.length) {
      const detail = violations
        .map((violation) => {
          const nodes = violation.nodes
            .slice(0, 5)
            .map((node) => `      - ${node.target.join(', ')}`)
            .join('\n');
          const extra =
            violation.nodes.length > 5 ? `\n      ... and ${violation.nodes.length - 5} more` : '';

          return [
            `[${violation.impact}] ${violation.id} - ${violation.help}`,
            `  ${violation.helpUrl}`,
            `  Affected elements (${violation.nodes.length}):`,
            `${nodes}${extra}`,
          ].join('\n');
        })
        .join('\n\n');

      await test.info().attach(`a11y-violations-${pageName}`, {
        body: detail,
        contentType: 'text/plain',
      });
    }

    expect(
      violations.map((violation) => `${violation.impact}: ${violation.id}`),
      `${pageName} should have no serious or critical WCAG violations`,
    ).toEqual([]);
  });
}
