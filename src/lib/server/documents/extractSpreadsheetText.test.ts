import ExcelJS from 'exceljs';
import { describe, expect, it } from 'vitest';
import { extractSpreadsheetText } from './extractSpreadsheetText';

async function workbookBytes(fillSheet: (sheet: ExcelJS.Worksheet) => void): Promise<Uint8Array> {
	const workbook = new ExcelJS.Workbook();
	fillSheet(workbook.addWorksheet('Survey'));
	const buffer = await workbook.xlsx.writeBuffer();
	return new Uint8Array(buffer);
}

describe('extractSpreadsheetText', () => {
	it('reads a sheet whose merged range has no value', async () => {
		const bytes = await workbookBytes((sheet) => {
			sheet.getCell('C1').value = 'Door';
			sheet.mergeCells('A1:B1');
		});
		const text = await extractSpreadsheetText(bytes);
		expect(text).toBe('=== Survey ===\n,,Door');
	});

	it('gives a merged range its text once, at its first cell', async () => {
		const bytes = await workbookBytes((sheet) => {
			sheet.getCell('A1').value = 'Level 2';
			sheet.mergeCells('A1:C1');
		});
		const text = await extractSpreadsheetText(bytes);
		expect(text).toBe('=== Survey ===\nLevel 2,,');
	});
});
