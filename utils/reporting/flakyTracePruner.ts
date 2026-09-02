/**
 * Drops the trace of a failed attempt once the test has passed on retry.
 *
 * A flaky test is still reported as FLAKY and keeps its failure screenshot and
 * error context, so the failure stays visible and diagnosable - but its trace,
 * the single largest artifact a run produces at 3-200MB apiece, is not carried
 * into the uploads for a test that ended up green. Traces of tests that
 * actually failed are left untouched.
 *
 * The work happens in `onExit`, the last hook Playwright calls: the Allure and
 * HTML reporters copy attachments out of `test-results` during their own
 * `onEnd`, so pruning any earlier would leave those copies behind - or race the
 * copy and dangle the link.
 *
 * Three stores hold the same trace, and each is handled differently. The raw
 * file under `test-results` is deleted. The Allure copy is deleted and its
 * reference removed from the result JSON, so the report the email and the
 * published site point at shows the screenshot with no missing attachment. The
 * HTML report names its copy after the file's SHA-1, so that copy is matched by
 * hash and deleted - its own index still lists the trace, so the button is there
 * with nothing behind it, which is the price of not shipping the file.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig, Reporter, Suite, TestResult } from '@playwright/test/reporter';
import { DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR } from '../../scripts/allurePaths';
import { REPO_ROOT } from '../../config/env';

/** Allure's content type for a Playwright trace, and the raw pair it comes from. */
const ALLURE_TRACE_TYPE = 'application/vnd.allure.playwright-trace';
const TRACE_ATTACHMENT_NAME = 'trace';

type AllureAttachment = { name?: string; type?: string; source?: string };
type AllureStep = { attachments?: AllureAttachment[]; steps?: AllureStep[] };
type AllureResult = {
  historyId?: string;
  status?: string;
  attachments?: AllureAttachment[];
  steps?: AllureStep[];
};

/** True for the trace attachment, in either the raw or the Allure-rewritten form. */
function isTraceAttachment(attachment: AllureAttachment): boolean {
  return (
    attachment.type === ALLURE_TRACE_TYPE ||
    (attachment.name === TRACE_ATTACHMENT_NAME && attachment.type === 'application/zip')
  );
}

/**
 * SHA-1 of a file's contents, read in chunks.
 *
 * The HTML reporter names each copied attachment `data/<sha1>.<ext>`, so this is
 * what matches a trace to the copy it made. Chunked because a trace of a long
 * test runs to hundreds of megabytes and must not be buffered whole.
 */
function hashFile(filePath: string): string | undefined {
  const hash = crypto.createHash('sha1');
  const buffer = Buffer.alloc(64 * 1024);
  let handle: number | undefined;

  try {
    handle = fs.openSync(filePath, 'r');

    for (;;) {
      const bytesRead = fs.readSync(handle, buffer, 0, buffer.length, null);

      if (bytesRead <= 0) {
        break;
      }

      hash.update(buffer.subarray(0, bytesRead));
    }

    return hash.digest('hex');
  } catch {
    return undefined;
  } finally {
    if (handle !== undefined) {
      fs.closeSync(handle);
    }
  }
}

/** Every `data` directory under the HTML report tree, whatever platform it sits in. */
function findAttachmentDataDirs(root: string): string[] {
  if (!fs.existsSync(root)) {
    return [];
  }

  const found: string[] = [];

  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const full = path.join(root, entry.name);

    if (entry.name === 'data') {
      found.push(full);
      continue;
    }

    found.push(...findAttachmentDataDirs(full));
  }

  return found;
}

/** Removes a file and reports the bytes it was occupying, ignoring one already gone. */
function deleteFile(filePath: string): number {
  try {
    const { size } = fs.statSync(filePath);
    fs.unlinkSync(filePath);

    return size;
  } catch {
    return 0;
  }
}

export default class FlakyTracePruner implements Reporter {
  private suite?: Suite;
  private tracesRemoved = 0;
  private bytesFreed = 0;
  private readonly prunedTraceHashes = new Set<string>();

  /** Keeps the root suite so `onExit` can ask each test how it finally ended. */
  onBegin(_config: FullConfig, suite: Suite): void {
    this.suite = suite;
  }

  /** Runs after every other reporter has written its copies. */
  async onExit(): Promise<void> {
    this.pruneTestResults();
    this.pruneHtmlReportCopies();
    this.pruneAllureResults();

    if (this.tracesRemoved > 0) {
      const megabytes = (this.bytesFreed / (1024 * 1024)).toFixed(1);
      console.log(
        `[artifacts] Dropped ${this.tracesRemoved} trace(s) from attempts that passed on retry (${megabytes} MB). Screenshots kept.`,
      );
    }
  }

  /** Deletes the trace files a flaky test left in `test-results`. */
  private pruneTestResults(): void {
    for (const test of this.suite?.allTests() ?? []) {
      if (test.outcome() !== 'flaky') {
        continue;
      }

      for (const result of test.results) {
        if (result.status !== 'passed') {
          this.deleteTraceAttachments(result);
        }
      }
    }
  }

  /** Unlinks the trace attachments of one failed attempt. */
  private deleteTraceAttachments(result: TestResult): void {
    const isRawTrace = (attachment: { name: string; contentType: string }): boolean =>
      attachment.name === TRACE_ATTACHMENT_NAME && attachment.contentType === 'application/zip';

    for (const attachment of result.attachments) {
      if (!isRawTrace(attachment) || !attachment.path) {
        continue;
      }

      const contentHash = hashFile(attachment.path);
      const freed = deleteFile(attachment.path);

      if (freed > 0) {
        this.tracesRemoved += 1;
        this.bytesFreed += freed;

        if (contentHash) {
          this.prunedTraceHashes.add(contentHash);
        }
      }
    }

    // Dropped from the in-memory result as well, so nothing downstream advertises
    // a file that is no longer on disk.
    result.attachments = result.attachments.filter((attachment) => !isRawTrace(attachment));
  }

  /** Deletes the HTML report's own hash-named copy of each pruned trace. */
  private pruneHtmlReportCopies(): void {
    if (this.prunedTraceHashes.size === 0) {
      return;
    }

    for (const dataDir of findAttachmentDataDirs(path.resolve(REPO_ROOT, 'playwright-report'))) {
      for (const contentHash of this.prunedTraceHashes) {
        this.bytesFreed += deleteFile(path.join(dataDir, `${contentHash}.zip`));
      }
    }
  }

  /**
   * Strips trace attachments from the Allure results of flaky tests.
   *
   * Both results directories are swept rather than only the running platform's:
   * a multi-location run writes several passes into the same directory, and the
   * merged report is built from whatever is left here.
   */
  private pruneAllureResults(): void {
    for (const resultsDir of [DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR]) {
      if (!fs.existsSync(resultsDir)) {
        continue;
      }

      const resultFiles = fs
        .readdirSync(resultsDir)
        .filter((name) => name.endsWith('-result.json'))
        .map((name) => path.join(resultsDir, name));

      const parsed = new Map<string, AllureResult>();
      const attemptsByHistoryId = new Map<string, string[]>();

      for (const file of resultFiles) {
        let result: AllureResult;

        try {
          result = JSON.parse(fs.readFileSync(file, 'utf-8')) as AllureResult;
        } catch {
          continue;
        }

        parsed.set(file, result);

        const historyId = result.historyId;

        if (!historyId) {
          continue;
        }

        attemptsByHistoryId.set(historyId, [...(attemptsByHistoryId.get(historyId) ?? []), file]);
      }

      for (const attemptFiles of attemptsByHistoryId.values()) {
        const attempts = attemptFiles.map((file) => ({ file, result: parsed.get(file) }));
        const passed = attempts.some(({ result }) => result?.status === 'passed');

        if (!passed) {
          continue;
        }

        for (const { file, result } of attempts) {
          if (!result || result.status === 'passed') {
            continue;
          }

          if (this.stripTraceAttachments(result, resultsDir)) {
            fs.writeFileSync(file, JSON.stringify(result), 'utf-8');
          }
        }
      }
    }
  }

  /** Removes trace entries from a result and its steps, deleting the files they name. */
  private stripTraceAttachments(result: AllureResult, resultsDir: string): boolean {
    let changed = false;

    const strip = (holder: { attachments?: AllureAttachment[]; steps?: AllureStep[] }): void => {
      if (holder.attachments?.length) {
        const kept = holder.attachments.filter((attachment) => {
          if (!isTraceAttachment(attachment)) {
            return true;
          }

          if (attachment.source) {
            const freed = deleteFile(path.join(resultsDir, attachment.source));

            if (freed > 0) {
              this.tracesRemoved += 1;
              this.bytesFreed += freed;
            }
          }

          changed = true;

          return false;
        });

        holder.attachments = kept;
      }

      for (const step of holder.steps ?? []) {
        strip(step);
      }
    };

    strip(result);

    return changed;
  }
}
