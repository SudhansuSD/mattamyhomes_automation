import {
  epic as allureEpic,
  feature as allureFeature,
  story as allureStory,
  owner as allureOwner,
  severity as allureSeverity,
  tags as allureTags,
  description as allureDescription,
  Severity,
} from 'allure-js-commons';

/**
 * Rich, filterable Allure metadata for a test or suite.
 *
 * Call `annotate({...})` from inside a `test.beforeEach` (for suite-level
 * epic/feature/owner) and/or from an individual test (for story/severity/
 * description) so every report is self-explanatory and filterable by
 * epic/feature/story/severity/owner/tag.
 *
 *   test.beforeEach(async () => {
 *     await annotate({ epic: 'Website', feature: 'Community', owner: 'QA Automation' });
 *   });
 */
export type AllureMeta = {
  /**
   * Location bucket this test belongs to: `'USA'`, `'CAN'`, or `'ALL'` for
   * suites whose assertions do not vary by country (or that cover both
   * countries in a single run).
   *
   * It becomes the Allure **epic**, so the Behaviors tab splits the whole
   * report by location first and by page second, and is also added as a tag so
   * the report can be filtered down to one country. Suites that run in every
   * location pass therefore appear under both USA and CAN — one entry per pass.
   */
  location?: string;
  epic?: string;
  feature?: string;
  story?: string;
  owner?: string;
  severity?: Severity;
  tags?: string[];
  description?: string;
};

export { Severity };

/** Apply any provided Allure labels to the currently-running test. */
export async function annotate(meta: AllureMeta): Promise<void> {
  // `location` takes the epic slot so the report groups by country; `epic` is
  // still honoured for anything that has no location dimension.
  const epic = meta.location ?? meta.epic;
  if (epic) await allureEpic(epic);
  if (meta.feature) await allureFeature(meta.feature);
  if (meta.story) await allureStory(meta.story);
  if (meta.owner) await allureOwner(meta.owner);
  if (meta.severity) await allureSeverity(meta.severity);

  const tags = [...(meta.tags ?? []), ...(meta.location ? [meta.location] : [])];
  if (tags.length) await allureTags(...tags);
  if (meta.description) await allureDescription(meta.description);
}
