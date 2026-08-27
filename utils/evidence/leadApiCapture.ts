import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';
import {
  appendShardRow,
  clearShards,
  getShardDir,
  readShards,
  writeWorkbookWithRetry,
} from './evidenceShardStore';

// Anchor output to the repo root so the file lands in the same place whether the
// run was launched from the IDE, a plain terminal, or CI (cwd-independent).
const REPO_ROOT = path.resolve(__dirname, '..');

export type LeadApiCaptureRow = {
  capturedAt: string;
  pageUrl: string;
  formName: string;
  requestMethod: string;
  requestUrl: string;
  responseStatus: number | '';
  responseData: string;
  notes?: string;
};

const DEFAULT_OUTPUT_FILE = path.resolve(REPO_ROOT, 'results', 'lead-api-data.xlsx');

const WORKSHEET_NAME = 'Lead API Data';

const WORKSHEET_COLUMNS = [
  { header: 'Captured At', key: 'capturedAt', width: 24 },
  { header: 'Page URL', key: 'pageUrl', width: 80 },
  { header: 'Form Name', key: 'formName', width: 34 },
  { header: 'Request Method', key: 'requestMethod', width: 16 },
  { header: 'Request URL', key: 'requestUrl', width: 80 },
  { header: 'Response Status', key: 'responseStatus', width: 16 },
  { header: 'Response Data', key: 'responseData', width: 120 },
  { header: 'Notes', key: 'notes', width: 40 },
] as const;

/** Absolute path of the workbook this run writes to (LEAD_API_CAPTURE_XLSX overrides). */
export function getLeadApiCaptureOutputFile(): string {
  return process.env.LEAD_API_CAPTURE_XLSX
    ? path.resolve(REPO_ROOT, process.env.LEAD_API_CAPTURE_XLSX)
    : DEFAULT_OUTPUT_FILE;
}

function shardDir(): string {
  return getShardDir(getLeadApiCaptureOutputFile(), 'lead-api');
}

/**
 * Records one captured lead API call.
 *
 * Appends to this worker's shard instead of rewriting the shared workbook.
 * Returns the workbook path so callers can report where it will land.
 */
export async function appendLeadApiCapture(row: LeadApiCaptureRow): Promise<string> {
  const outputFile = getLeadApiCaptureOutputFile();

  appendShardRow(shardDir(), { outputFile }, row);

  return outputFile;
}

/**
 * Merges every worker shard into the xlsx, then clears them.
 *
 * Runs once from globalTeardown so there is a single writer. Existing content
 * is read first, so a multi-location run accumulates into one file.
 */
export async function mergeLeadApiCaptures(): Promise<{
  outputFile: string;
  rowsMerged: number;
} | null> {
  const dir = shardDir();
  const { rows, meta } = readShards<LeadApiCaptureRow>(dir);

  if (!rows.length) {
    return null;
  }

  // Workers finish out of order; capture time is the meaningful sequence.
  rows.sort((left, right) => left.capturedAt.localeCompare(right.capturedAt));

  const outputFile = meta?.outputFile ?? getLeadApiCaptureOutputFile();
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(outputFile)) {
    await workbook.xlsx.readFile(outputFile);
  }

  const worksheet = workbook.getWorksheet(WORKSHEET_NAME) ?? workbook.addWorksheet(WORKSHEET_NAME);

  if (worksheet.rowCount === 0) {
    worksheet.columns = WORKSHEET_COLUMNS.map((column) => ({ ...column }));
    worksheet.getRow(1).font = { bold: true };
  } else {
    // Excel files do not persist ExcelJS column keys. Restore them after readFile()
    // so object-based rows and key-based getColumn() calls keep working.
    WORKSHEET_COLUMNS.forEach((definition, index) => {
      const column = worksheet.getColumn(index + 1);
      column.key = definition.key;
      column.width = definition.width;
    });
  }

  for (const row of rows) {
    worksheet.addRow(row);
  }

  worksheet.getColumn('responseData').alignment = { wrapText: true, vertical: 'top' };
  worksheet.getColumn('pageUrl').alignment = { wrapText: true, vertical: 'top' };
  worksheet.getColumn('requestUrl').alignment = { wrapText: true, vertical: 'top' };

  const writtenFile = await writeWorkbookWithRetry(workbook, outputFile);

  // Only after the write succeeded - a killed run keeps its shards for next time.
  clearShards(dir);

  return { outputFile: writtenFile, rowsMerged: rows.length };
}
