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
  if (meta.epic) await allureEpic(meta.epic);
  if (meta.feature) await allureFeature(meta.feature);
  if (meta.story) await allureStory(meta.story);
  if (meta.owner) await allureOwner(meta.owner);
  if (meta.severity) await allureSeverity(meta.severity);
  if (meta.tags?.length) await allureTags(...meta.tags);
  if (meta.description) await allureDescription(meta.description);
}
