import {
  epic as allureEpic,
  feature as allureFeature,
  story as allureStory,
  owner as allureOwner,
  parentSuite as allureParentSuite,
  severity as allureSeverity,
  tags as allureTags,
  description as allureDescription,
  Severity,
} from 'allure-js-commons';
import { test } from '@playwright/test';
import { isMobileBrowserProject } from '../../config/browserSelection';

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

/**
 * 'Mobile' on the phone device profiles, 'Web' on the desktop browsers.
 *
 * Read from the running project's `metadata.platform`, which is the same value
 * the report labels a result with, so a run started with `--project` rather than
 * BROWSER is still labelled correctly. Falls back to the BROWSER selection when
 * there is no project metadata to read.
 */
export function getPlatformLabel(): 'Mobile' | 'Web' {
  const platform = (() => {
    try {
      return test.info().project.metadata?.platform as string | undefined;
    } catch {
      return undefined;
    }
  })();

  if (platform) {
    return platform === 'mobile' ? 'Mobile' : 'Web';
  }

  return isMobileBrowserProject() ? 'Mobile' : 'Web';
}

/**
 * Apply any provided Allure labels to the currently-running test.
 *
 * The Web/Mobile platform is added here rather than in each spec: the same
 * specs run on both, so the platform is a property of the run, not of the test.
 * Every spec already calls this in its `beforeEach`, so labelling it centrally
 * keeps the two platforms distinguishable in one place.
 */
export async function annotate(meta: AllureMeta): Promise<void> {
  // `location` takes the epic slot so the report groups by country; `epic` is
  // still honoured for anything that has no location dimension.
  const epic = meta.location ?? meta.epic;
  if (epic) await allureEpic(epic);
  if (meta.feature) await allureFeature(meta.feature);
  if (meta.story) await allureStory(meta.story);
  if (meta.owner) await allureOwner(meta.owner);
  if (meta.severity) await allureSeverity(meta.severity);

  // parentSuite, not epic: epic is the location dimension, so this splits the
  // Suites tree by platform without collapsing the country grouping.
  const platform = getPlatformLabel();
  await allureParentSuite(platform);

  // Deduplicated: annotate() is called from both a suite beforeEach and
  // individual tests, so the same tag would otherwise be emitted twice.
  const tags = [
    ...new Set([
      ...(meta.tags ?? []),
      ...(meta.location ? [meta.location] : []),
      platform.toLowerCase(),
    ]),
  ];
  if (tags.length) await allureTags(...tags);
  if (meta.description) await allureDescription(meta.description);
}
