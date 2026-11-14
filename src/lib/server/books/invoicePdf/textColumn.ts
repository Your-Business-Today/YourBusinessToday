import type { PDFPage } from 'pdf-lib';
import type { PdfPen, TextRow } from './pdfPen';

/** Text written down the page from one edge: the rows, where the column starts, how wide it is, and which edge it keeps to. */
export type TextColumn = { rows: TextRow[]; x: number; width: number; isRightAligned?: boolean };

export function columnHeightOf(pen: PdfPen, column: TextColumn): number {
	const heights = column.rows.map((row) => pen.linesOf(row, column.width).length * pen.lineHeightOf(row.style));
	return heights.reduce((total, height) => total + height, 0);
}

/** Writes the column's rows down the page from the top given, each wrapped to the column's width. */
export function writeColumnOn(page: PDFPage, pen: PdfPen, column: TextColumn, top: number): void {
	let lineTop = top;
	for (const row of column.rows) {
		for (const line of pen.linesOf(row, column.width)) {
			const lineWidth = pen.widthOf(line, row.style);
			const x = column.isRightAligned === true ? column.x + column.width - lineWidth : column.x;
			const { size } = row.style;
			page.drawText(line, { x, y: lineTop - size, size, font: pen.fontOf(row.style), color: pen.inkOf(row.style) });
			lineTop -= pen.lineHeightOf(row.style);
		}
	}
}

/** The column as one column per written line, so a long block can run on to the next page between any two lines. */
export function columnLineByLine(pen: PdfPen, column: TextColumn): TextColumn[] {
	return column.rows.flatMap((row) =>
		pen.linesOf(row, column.width).map((line) => ({ ...column, rows: [{ text: line, style: row.style }] }))
	);
}
