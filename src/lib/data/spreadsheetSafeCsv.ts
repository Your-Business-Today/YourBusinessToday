const byteOrderMarkForSpreadsheets = '﻿';
const lineBreak = '\r\n';
const formulaOpeners = /^[=+\-@\t\r]/;
const textMark = "'";

/** Rows as a CSV file a spreadsheet opens as plain text: every cell quoted, and a cell that would start a formula marked as text so nothing in it runs. */
export function spreadsheetSafeCsv(rows: string[][]): string {
	const lines = rows.map((cells) => cells.map(spreadsheetSafeCell).join(','));
	return byteOrderMarkForSpreadsheets + lines.join(lineBreak) + lineBreak;
}

function spreadsheetSafeCell(cell: string): string {
	const isFormula = formulaOpeners.test(cell);
	const inert = isFormula ? textMark + cell : cell;
	return `"${inert.replaceAll('"', '""')}"`;
}
