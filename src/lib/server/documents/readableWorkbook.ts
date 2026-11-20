import JSZip from 'jszip';
import { removeDrawings } from './removeDrawings';
import { unprefixSpreadsheetMarkup } from './unprefixSpreadsheetMarkup';

/** The workbook rewritten into the shape exceljs reads, with its cells unchanged. */
export async function readableWorkbook(workbookBytes: Uint8Array): Promise<ArrayBuffer> {
	const archive = await JSZip.loadAsync(workbookBytes);
	await removeDrawings(archive);
	await unprefixSpreadsheetMarkup(archive);
	return archive.generateAsync({ type: 'arraybuffer' });
}
