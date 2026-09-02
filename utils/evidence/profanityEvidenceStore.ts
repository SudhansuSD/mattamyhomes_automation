import fs from 'node:fs';
import path from 'node:path';
import ExcelJS from 'exceljs';
import {
  appendShardRow,
  clearShards,
  getShardDir,
  readShards,
  writeWorkbookWithRetry,
} from './evidenceShardStore';

/**
 * Excel evidence for the profanity lead-form suite.
 *
 * Rows go to per-worker shards and are merged once in globalTeardown:
 * rewriting the whole workbook per test races across workers.
 *
 * The row shape lives here, not in the spec, because the merge happens after
 * the spec's workers exit - and because that spec is gitignored, so this keeps
 * the workbook format under version control.
 */

export type YesNo = 'Yes' | 'No';
export type TestStatus = 'Passed' | 'Failed';

export type ProfanityEvidenceRow = {
  testCase: string;
  page: string;
  formName: string;
  url: string;
  firstName: string;
  lastName: string;
  communityOfInterest: string;
  emailId: string;
  countryOfResidence: string;
  zipCode: string;
  comment: string;
  phoneNumber: string;
  formSubmissionAttempted: YesNo;
  websiteConfirmationDisplayed: YesNo;
  updateApiTriggered: YesNo;
  updateApiUrl: string;
  updateApiStatusCode: string;
  updateApiPayload: string;
  updateApiResponseBody: string;
  sitecoreLeadApiTriggered: YesNo;
  sitecoreLeadProcessed: YesNo;
  sitecoreApiUrl: string;
  sitecoreLeadPayload: string;
  sitecoreResponseBody: string;
  testStatus: TestStatus;
  failureReason: string;
};

const WORKSHEET_NAME = 'Profanity Evidence';

const EVIDENCE_COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: 'Test case', key: 'testCase', width: 55 },
  { header: 'Page', key: 'page', width: 25 },
  { header: 'Form Name', key: 'formName', width: 25 },
  { header: 'URL', key: 'url', width: 90 },
  { header: 'First Name', key: 'firstName', width: 20 },
  { header: 'Last Name', key: 'lastName', width: 20 },
  { header: 'Community of Interest', key: 'communityOfInterest', width: 85 },
  { header: 'Email ID', key: 'emailId', width: 55 },
  { header: 'Country of Residence', key: 'countryOfResidence', width: 25 },
  { header: 'ZIP code', key: 'zipCode', width: 15 },
  { header: 'comment', key: 'comment', width: 60 },
  { header: 'Phone Number', key: 'phoneNumber', width: 20 },
  { header: 'Form Submission Attempted', key: 'formSubmissionAttempted', width: 32 },
  { header: 'Website Confirmation Displayed', key: 'websiteConfirmationDisplayed', width: 35 },
  { header: 'Form Update API Triggered', key: 'updateApiTriggered', width: 30 },
  { header: 'Form Update API URL', key: 'updateApiUrl', width: 90 },
  { header: 'Form Update API Status Code', key: 'updateApiStatusCode', width: 28 },
  { header: 'Form Update API Payload', key: 'updateApiPayload', width: 90 },
  { header: 'Form Update API Response Body', key: 'updateApiResponseBody', width: 80 },
  { header: 'Sitecore Lead API Triggered', key: 'sitecoreLeadApiTriggered', width: 32 },
  { header: 'Sitecore Lead Processed', key: 'sitecoreLeadProcessed', width: 30 },
  { header: 'Sitecore Lead API URL', key: 'sitecoreApiUrl', width: 90 },
  { header: 'Sitecore Lead API Payload', key: 'sitecoreLeadPayload', width: 90 },
  { header: 'Sitecore Response Body', key: 'sitecoreResponseBody', width: 80 },
  { header: 'Test Status', key: 'testStatus', width: 15 },
  { header: 'Failure Reason', key: 'failureReason', width: 90 },
];

const EVIDENCE_KEYS = EVIDENCE_COLUMNS.map((column) => column.key as keyof ProfanityEvidenceRow);

function shardDirFor(outputFile: string): string {
  return getShardDir(outputFile, 'profanity-evidence');
}

/** Records one row. Called from the spec's `finally`, so it lands either way. */
export function appendProfanityEvidenceRow(
  row: ProfanityEvidenceRow,
  paths: { outputFile: string; legacyOutputFile?: string },
): void {
  appendShardRow(shardDirFor(paths.outputFile), paths, row);
}

function stringifyCellValue(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'object') {
    const richText = (value as ExcelJS.CellRichTextValue).richText;
    if (richText) {
      return richText.map((part) => part.text).join('');
    }

    const text = (value as ExcelJS.CellHyperlinkValue).text;
    if (typeof text === 'string') {
      return text;
    }

    const result = (value as ExcelJS.CellFormulaValue).result;
    if (result !== undefined) {
      return String(result);
    }

    return '';
  }

  return String(value);
}

/** Reads rows already in the workbook so a re-run adds to the evidence, not replaces it. */
async function readExistingRows(outputFile: string): Promise<ProfanityEvidenceRow[]> {
  if (!fs.existsSync(outputFile)) {
    return [];
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(outputFile);

  const worksheet = workbook.getWorksheet(WORKSHEET_NAME) ?? workbook.worksheets[0];
  if (!worksheet) {
    return [];
  }

  const rows: ProfanityEvidenceRow[] = [];

  worksheet.eachRow((worksheetRow, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const row = {} as ProfanityEvidenceRow;

    EVIDENCE_KEYS.forEach((key, index) => {
      (row as Record<string, string>)[key as string] = stringifyCellValue(
        worksheetRow.getCell(index + 1).value,
      );
    });

    if (row.testCase) {
      rows.push(row);
    }
  });

  return rows;
}

/** Later rows win, keyed by test case - a re-run updates its row instead of duplicating it. */
function mergeRows(...rowGroups: ProfanityEvidenceRow[][]): ProfanityEvidenceRow[] {
  const merged = new Map<string, ProfanityEvidenceRow>();

  rowGroups.flat().forEach((row) => {
    merged.set(row.testCase, row);
  });

  return [...merged.values()];
}

function applyWorkbookFormatting(worksheet: ExcelJS.Worksheet): void {
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });
}

/**
 * Folds every worker shard into the profanity evidence workbook.
 *
 * Runs once, in the main process, from playwrightGlobalTeardown. Returns null
 * when the suite did not run, so teardown stays silent on unrelated runs.
 */
export async function mergeProfanityEvidence(
  outputFile?: string,
): Promise<{ outputFile: string; rowsMerged: number } | null> {
  // Without an explicit path, discover the shard set from the default evidence
  // folder - teardown has no idea which env/location the spec was built for.
  const searchRoots = outputFile ? [shardDirFor(outputFile)] : discoverShardDirs();

  for (const dir of searchRoots) {
    const { rows, meta } = readShards<ProfanityEvidenceRow>(dir);

    if (!rows.length || !meta?.outputFile) {
      continue;
    }

    const existing = await readExistingRows(meta.outputFile);
    const mergedRows = mergeRows(existing, rows);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(WORKSHEET_NAME);

    worksheet.columns = EVIDENCE_COLUMNS;
    mergedRows.forEach((row) => worksheet.addRow(row));
    applyWorkbookFormatting(worksheet);

    const writtenFile = await writeWorkbookWithRetry(workbook, meta.outputFile);

    if (meta.legacyOutputFile) {
      await writeWorkbookWithRetry(workbook, meta.legacyOutputFile);
    }

    clearShards(dir);

    return { outputFile: writtenFile, rowsMerged: rows.length };
  }

  return null;
}

/** Finds profanity shard folders left by the run, wherever the spec pointed them. */
function discoverShardDirs(): string[] {
  const candidates = [
    path.resolve(process.cwd(), process.env.FORM_EVIDENCE_OUTPUT_DIR ?? ''),
    path.resolve(process.cwd(), 'reports', 'form-submissions'),
  ].filter(Boolean);

  return candidates
    .map((dir) => path.join(dir, '.profanity-evidence-shards'))
    .filter((dir) => fs.existsSync(dir));
}
