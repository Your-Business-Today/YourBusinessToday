import ExcelJS from 'exceljs';
import { csvLine } from '$lib/data/csvLine';

const sheetHeading = (name: string) => `=== ${name} ===`;

/** Every sheet as CSV, each under its name. */
export async function extractSpreadsheetText(fileBytes: Uint8Array): Promise<string> {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(arrayBufferOf(fileBytes));
	return workbook.worksheets.map(sheetAsCsv).join('\n\n');
}

function arrayBufferOf(bytes: Uint8Array): ArrayBuffer {
	const copy = new ArrayBuffer(bytes.byteLength);
	new Uint8Array(copy).set(bytes);
	return copy;
}

function sheetAsCsv(sheet: ExcelJS.Worksheet): string {
	const lines = [sheetHeading(sheet.name)];
	for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
		lines.push(rowAsCsv(sheet.getRow(rowNumber), sheet.columnCount));
	}
	return lines.join('\n');
}

function rowAsCsv(row: ExcelJS.Row, columnCount: number): string {
	const values: string[] = [];
	for (let columnNumber = 1; columnNumber <= columnCount; columnNumber += 1) {
		values.push(cellText(row.getCell(columnNumber)));
	}
	return csvLine(values);
}

function cellText(cell: ExcelJS.Cell): string {
	if (isCoveredByMerge(cell)) return '';
	if (cell.value instanceof Date) return isoDateOrTime(cell.value);
	return cell.text;
}

function isCoveredByMerge(cell: ExcelJS.Cell): boolean {
	return cell.isMerged && cell.master !== cell;
}

function isoDateOrTime(date: Date): string {
	const iso = date.toISOString();
	if (iso.endsWith('T00:00:00.000Z')) return iso.slice(0, 'YYYY-MM-DD'.length);
	return iso.slice(0, 'YYYY-MM-DDTHH:MM'.length);
}
