import fs from 'node:fs';
import path from 'node:path';
import type ExcelJS from 'exceljs';

// Each worker appends JSON lines to its own shard and globalTeardown merges them once, because
// concurrent read-modify-write of one .xlsx loses rows and corrupts the zip.

/** Where the merged workbook goes; stored next to the shards. */
export type ShardMeta = {
  outputFile: string;
  legacyOutputFile?: string;
};

const META_FILE = 'meta.json';

/** Shard folder next to the workbook. */
export function getShardDir(outputFile: string, name: string): string {
  return path.join(path.dirname(outputFile), `.${name}-shards`);
}

/** This worker's shard file; includes the pid since worker indexes are reused after restarts. */
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

/** Reads every shard, skipping malformed lines. */
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

/** Deletes a shard set; call only after the workbook is written. */
export function clearShards(shardDir: string): void {
  fs.rmSync(shardDir, { recursive: true, force: true });
}

/** Writes the workbook, retrying while it is locked and falling back to a sibling file. */
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
