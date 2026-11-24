// Deletes traces of failed attempts for tests that passed on retry (traces are large; screenshots
// stay). Runs in onExit so the Allure and HTML reporters have already copied their attachments.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import type { FullConfig, Reporter, Suite, TestResult } from '@playwright/test/reporter';
import { DESKTOP_ALLURE_RESULTS_DIR, MOBILE_ALLURE_RESULTS_DIR } from '../../scripts/allurePaths';
import { REPO_ROOT } from '../../config/env';

/** Allure's content type for a Playwright trace, and the raw attachment name. */
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

/** True for a trace attachment, raw or Allure form. */
function isTraceAttachment(attachment: AllureAttachment): boolean {
  return (
    attachment.type === ALLURE_TRACE_TYPE ||
    (attachment.name === TRACE_ATTACHMENT_NAME && attachment.type === 'application/zip')
  );
}

/** SHA-1 of a file, read in chunks; matches the HTML report's hash-named copy. */
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

/** Finds every `data` directory under the HTML report tree. */
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

/** Deletes a file and returns its size, or 0 if it is already gone. */
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

  /** Keeps the root suite for `onExit`. */
  onBegin(_config: FullConfig, suite: Suite): void {
    this.suite = suite;
  }

  /** Prunes flaky traces from every store after other reporters finish. */
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

    // Also drop them from the in-memory result so nothing points at deleted files.
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

  /** Strips trace attachments from flaky tests' Allure results in both results directories. */
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
