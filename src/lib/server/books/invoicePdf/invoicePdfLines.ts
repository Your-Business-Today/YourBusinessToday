import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { a4Page, lineColumnWidths, tableRowSpace, writingWidth } from './invoicePdfLayout';
import type { InvoicePdfSheet } from './invoicePdfSheet';
import { penStyles, rowOf } from './invoicePdfRows';
import type { PenStyle } from './pdfPen';
import type { TextColumn } from './textColumn';

/** The four cells of one row of the lines table, as the page and the email show them. */
type LineCells = { description: string; quantity: string; unitPrice: string; amount: string };

const headingCells: LineCells = { description: 'Description', quantity: 'Quantity', unitPrice: 'Unit price', amount: 'Amount' };

const { quantity, unitPrice, amount } = lineColumnWidths;
const descriptionWidth = writingWidth - quantity - unitPrice - amount;
const columnStarts = {
	description: a4Page.margin,
	quantity: a4Page.margin + descriptionWidth,
	unitPrice: a4Page.margin + descriptionWidth + quantity,
	amount: a4Page.margin + descriptionWidth + quantity + unitPrice
};

/** The invoice's lines and their total; a line that will not fit starts a new page, which repeats the column headings. */
export function writeLinesTable(sheet: InvoicePdfSheet, document: InvoiceDocument): void {
	writeHeadings(sheet);
	for (const line of document.lines) {
		const cells = {
			description: line.description,
			quantity: String(line.quantity),
			unitPrice: formatPoundsAndPence(line.unitPrice),
			amount: formatPoundsAndPence(line.amount)
		};
		writeLine(sheet, cellColumnsOf(cells, penStyles.body));
	}
	sheet.rule();
	const totals = { description: 'Total', quantity: '', unitPrice: '', amount: formatPoundsAndPence(document.total) };
	writeLine(sheet, cellColumnsOf(totals, penStyles.strong));
}

function writeHeadings(sheet: InvoicePdfSheet): void {
	sheet.writeColumns(cellColumnsOf(headingCells, penStyles.heading));
	sheet.rule();
}

function writeLine(sheet: InvoicePdfSheet, columns: TextColumn[]): void {
	const hasTurnedPage = sheet.makeRoomFor(sheet.heightOf(columns) + tableRowSpace);
	if (hasTurnedPage) writeHeadings(sheet);
	sheet.writeColumns(columns);
	sheet.space(tableRowSpace);
}

function cellColumnsOf(cells: LineCells, style: PenStyle): TextColumn[] {
	return [
		{ rows: [rowOf(cells.description, style)], x: columnStarts.description, width: descriptionWidth },
		{ rows: [rowOf(cells.quantity, style)], x: columnStarts.quantity, width: quantity, isRightAligned: true },
		{ rows: [rowOf(cells.unitPrice, style)], x: columnStarts.unitPrice, width: unitPrice, isRightAligned: true },
		{ rows: [rowOf(cells.amount, style)], x: columnStarts.amount, width: amount, isRightAligned: true }
	];
}
