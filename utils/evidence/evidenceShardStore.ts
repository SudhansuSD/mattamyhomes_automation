import fs from 'node:fs';
import path from 'node:path';
import type ExcelJS from 'exceljs';

/**
 * Collects evidence rows without two workers fighting over one .xlsx.
 *
 * Workers are separate processes, so a read-modify-write of a shared workbook
 * loses rows - and ExcelJS writes a zip, so a read landing mid-write fails with
 * "Corrupted zip ?". Instead each worker appends JSON lines to its own file and
 * globalTeardown merges them once. Shards left by a killed run are picked up by
 * the next one.
 */

/** Where the merged workbook should end up. Stored next to the shards. */
export type ShardMeta = {
  outputFile: string;
  legacyOutputFile?: string;
};

const META_FILE = 'meta.json';

/** Shard folder, kept next to the workbook so one .gitignore entry covers both. */
export function getShardDir(outputFile: string, name: string): string {
  return path.join(path.dirname(outputFile), `.${name}-shards`);
}

/**
 * One shard file per worker process.
 *
 * The pid is in the name because Playwright reuses TEST_PARALLEL_INDEX after a
 * worker restart, and a restarted worker must not truncate its predecessor's shard.
 */
function getShardFile(shardDir: string): string {
  const workerIndex = process.env.TEST_WORKER_INDEX ?? process.env.TEST_PARALLEL_INDEX ?? '0';
  return path.join(shardDir, `shard-w${workerIndex}-p${process.pid}.jsonl`);
}

/** Appends one row to this worker's shard. */
export function appendShardRow<T>(shardDir: string, meta: ShardMeta, row: T): void {
  fs.mkdirSync(shardDir, { recursive: true });

  const metaPath = path.join(shardDir, META_FILE);
  if (!fs.existsSync(metaPath)) {
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');
  }

  fs.appendFileSync(getShardFile(shardDir), `${JSON.stringify(row)}\n`, 'utf8');
}

/** Reads every shard. A malformed line is skipped, not fatal. */
export function readShards<T>(shardDir: string): {
  rows: T[];
  shardFiles: string[];
  meta: ShardMeta | null;
} {
  if (!fs.existsSync(shardDir)) {
    return { rows: [], shardFiles: [], meta: null };
  }

  const shardFiles = fs
    .readdirSync(shardDir)
    .filter((name) => name.endsWith('.jsonl'))
    .map((name) => path.join(shardDir, name));

  const rows: T[] = [];

  for (const shardFile of shardFiles) {
    for (const line of fs.readFileSync(shardFile, 'utf8').split('\n')) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      try {
        rows.push(JSON.parse(trimmed) as T);
      } catch {
        console.warn(`[evidence] Skipping malformed row in ${path.basename(shardFile)}`);
      }
    }
  }

  let meta: ShardMeta | null = null;
  const metaPath = path.join(shardDir, META_FILE);

  if (fs.existsSync(metaPath)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as ShardMeta;
    } catch {
      console.warn(`[evidence] Unreadable shard meta at ${metaPath}`);
    }
  }

  return { rows, shardFiles, meta };
}

/** Deletes a consumed shard set. Call only after the workbook write succeeded. */
export function clearShards(shardDir: string): void {
  fs.rmSync(shardDir, { recursive: true, force: true });
}

/**
 * Writes the workbook, retrying while Excel holds it open.
 *
 * These files are often open on someone's desktop when a run finishes. Rather
 * than lose the rows, back off and finally write to a sibling file.
 */
export async function writeWorkbookWithRetry(
  workbook: ExcelJS.Workbook,
  outputFile: string,
): Promise<string> {
  const maxAttempts = 5;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await workbook.xlsx.writeFile(outputFile);
      return outputFile;
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code ?? '';

      if (!['EBUSY', 'EPERM', 'EACCES'].includes(code)) {
        throw error;
      }

      if (attempt === maxAttempts) {
        const parsed = path.parse(outputFile);
        const fallback = path.join(parsed.dir, `${parsed.name}.locked-${process.pid}${parsed.ext}`);

        await workbook.xlsx.writeFile(fallback);
        console.warn(`[evidence] ${outputFile} is locked; wrote to ${fallback} instead.`);

        return fallback;
      }

      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  return outputFile;
}
