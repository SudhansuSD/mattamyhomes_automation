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

/** Allure labels for a test or suite, passed to `annotate()`. */
export type AllureMeta = {
  /** `'USA'`, `'CAN'` or `'ALL'`; used as the Allure epic and as a tag. */
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

/** 'Mobile' or 'Web', from the project's metadata, falling back to BROWSER. */
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

/** Applies the given Allure labels, plus the Web/Mobile platform, to the current test. */
export async function annotate(meta: AllureMeta): Promise<void> {
  // Location takes the epic slot so the report groups by country.
  const epic = meta.location ?? meta.epic;
  if (epic) await allureEpic(epic);
  if (meta.feature) await allureFeature(meta.feature);
  if (meta.story) await allureStory(meta.story);
  if (meta.owner) await allureOwner(meta.owner);
  if (meta.severity) await allureSeverity(meta.severity);

  // Platform goes in parentSuite because epic already holds the location.
  const platform = getPlatformLabel();
  await allureParentSuite(platform);

  // Deduplicated since annotate() can run from both beforeEach and the test.
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
