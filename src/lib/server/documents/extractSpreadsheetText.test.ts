import ExcelJS from 'exceljs';
import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { extractSpreadsheetText, UnreadableWorkbook } from './extractSpreadsheetText';

async function workbookBytes(fillSheet: (sheet: ExcelJS.Worksheet) => void): Promise<Uint8Array> {
	const workbook = new ExcelJS.Workbook();
	fillSheet(workbook.addWorksheet('Survey'));
	const buffer = await workbook.xlsx.writeBuffer();
	return new Uint8Array(buffer);
}

const onePixelPicture =
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const drawingPartName = 'xl/drawings/drawing1.xml';

async function workbookWithPicture(): Promise<Uint8Array> {
	return workbookBytes((sheet) => {
		sheet.getCell('A1').value = 'Door';
		const pictureId = sheet.workbook.addImage({ base64: onePixelPicture, extension: 'png' });
		sheet.addImage(pictureId, 'C1:D3');
	});
}

async function withDrawingUnprefixed(bytes: Uint8Array): Promise<Uint8Array> {
	const archive = await JSZip.loadAsync(bytes);
	const drawingXml = await archive.file(drawingPartName)!.async('string');
	archive.file(drawingPartName, drawingXml.replaceAll('xdr:', '').replace('xmlns:xdr', 'xmlns'));
	return archive.generateAsync({ type: 'uint8array' });
}

const spreadsheetPart = /^xl\/.+\.xml$/;

async function withSpreadsheetMarkupPrefixed(bytes: Uint8Array): Promise<Uint8Array> {
	const archive = await JSZip.loadAsync(bytes);
	for (const part of archive.file(spreadsheetPart)) {
		const partXml = await part.async('string');
		const prefixed = partXml.replace(/<(\/?)(?![?!])(\w+[\s>/])/g, '<$1x:$2');
		archive.file(part.name, prefixed.replace(/\sxmlns="/, ' xmlns:x="'));
	}
	return archive.generateAsync({ type: 'uint8array' });
}

describe('extractSpreadsheetText', () => {
	it('reads a workbook whose spreadsheet markup carries a prefix', async () => {
		const bytes = await workbookBytes((sheet) => {
			sheet.getCell('A1').value = 'Door';
			sheet.getCell('B1').value = 3;
		});
		const text = await extractSpreadsheetText(await withSpreadsheetMarkupPrefixed(bytes));
		expect(text).toBe('=== Survey ===\nDoor,3');
	});

	it('refuses a file that is not a workbook', async () => {
		const notAWorkbook = new TextEncoder().encode('an old .xls, or a damaged file');
		await expect(extractSpreadsheetText(notAWorkbook)).rejects.toBeInstanceOf(UnreadableWorkbook);
	});


	it('reads the cells of a sheet holding a picture', async () => {
		const text = await extractSpreadsheetText(await workbookWithPicture());
		expect(text).toBe('=== Survey ===\nDoor');
	});

	it('reads the cells of a sheet whose drawing has no xdr prefix', async () => {
		const bytes = await withDrawingUnprefixed(await workbookWithPicture());
		const text = await extractSpreadsheetText(bytes);
		expect(text).toBe('=== Survey ===\nDoor');
	});

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
