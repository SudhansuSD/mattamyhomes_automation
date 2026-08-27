import AxeBuilder from '@axe-core/playwright';
import { expect, Page, test } from '@playwright/test';

/**
 * WCAG scanning for the page templates.
 *
 * Serious and critical only. Minor and moderate findings on a marketing site
 * this size arrive in the hundreds and train everyone to ignore the report.
 */

const DEFAULT_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

export type AccessibilityScanOptions = {
  /** CSS selectors to exclude - third-party embeds we do not control. */
  exclude?: string[];
  /** Rule ids to skip, each with the reason it is knowingly deferred. */
  disableRules?: string[];
  /** Fail on moderate findings too. Off by default - see the note above. */
  includeModerate?: boolean;
};

/**
 * Scans the page and fails on serious/critical violations.
 *
 * Each one is attached with its rule, impact, help URL and selectors so the
 * failure is actionable without re-running locally.
 */
export async function expectNoAccessibilityViolations(
  page: Page,
  pageName: string,
  options: AccessibilityScanOptions = {},
): Promise<void> {
  await test.step(`Accessibility scan: ${pageName}`, async () => {
    let builder = new AxeBuilder({ page }).withTags(DEFAULT_TAGS);

    // Third-party iframes (maps, Dynamics forms, floorplan tools) are not ours
    // to fix and would otherwise dominate every result.
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
