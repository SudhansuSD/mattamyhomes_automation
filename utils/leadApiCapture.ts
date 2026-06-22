import fs from 'fs';
import path from 'path';
import ExcelJS from 'exceljs';

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

const DEFAULT_OUTPUT_FILE = path.resolve(process.cwd(), 'results', 'lead-api-data.xlsx');

const WORKSHEET_NAME = 'Lead API Data';

export async function appendLeadApiCapture(row: LeadApiCaptureRow): Promise<string> {
  const outputFile = process.env.LEAD_API_CAPTURE_XLSX
    ? path.resolve(process.cwd(), process.env.LEAD_API_CAPTURE_XLSX)
    : DEFAULT_OUTPUT_FILE;

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });

  const workbook = new ExcelJS.Workbook();

  if (fs.existsSync(outputFile)) {
    await workbook.xlsx.readFile(outputFile);
  }

  const worksheet = workbook.getWorksheet(WORKSHEET_NAME) ?? workbook.addWorksheet(WORKSHEET_NAME);

  if (worksheet.rowCount === 0) {
    worksheet.columns = [
      { header: 'Captured At', key: 'capturedAt', width: 24 },
      { header: 'Page URL', key: 'pageUrl', width: 80 },
      { header: 'Form Name', key: 'formName', width: 34 },
      { header: 'Request Method', key: 'requestMethod', width: 16 },
      { header: 'Request URL', key: 'requestUrl', width: 80 },
      { header: 'Response Status', key: 'responseStatus', width: 16 },
      { header: 'Response Data', key: 'responseData', width: 120 },
      { header: 'Notes', key: 'notes', width: 40 }
    ];
    worksheet.getRow(1).font = { bold: true };
  }

  worksheet.addRow(row);
  worksheet.getColumn('responseData').alignment = { wrapText: true, vertical: 'top' };
  worksheet.getColumn('pageUrl').alignment = { wrapText: true, vertical: 'top' };
  worksheet.getColumn('requestUrl').alignment = { wrapText: true, vertical: 'top' };

  await workbook.xlsx.writeFile(outputFile);
  return outputFile;
}
