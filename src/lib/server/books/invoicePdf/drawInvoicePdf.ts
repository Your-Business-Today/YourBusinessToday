import { documentStampOf, headingFactsOf, isSayingHowToPay, owingFactsOf } from '$lib/components/books/invoiceDocumentView';
import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { a4Page, writingWidth } from './invoicePdfLayout';
import { writeLinesTable } from './invoicePdfLines';
import { InvoicePdfSheet } from './invoicePdfSheet';
import { factRowsOf, howToPayRowsOf, partyRowsOf, penStyles, rowOf } from './invoicePdfRows';
import type { TextColumn } from './textColumn';

const sellerShare = 0.55;
const sellerWidth = writingWidth * sellerShare;
const headingWidth = writingWidth - sellerWidth;
const rightHalf = { x: a4Page.margin + writingWidth / 2, width: writingWidth / 2, isRightAligned: true };
const wholeWidth = { x: a4Page.margin, width: writingWidth };

/**
 * The invoice drawn as an A4 PDF from the same description as its page and its email, so the three never disagree:
 * both companies, the number and dates, the lines, the total, what is paid and owed, and how to pay.
 */
export async function drawInvoicePdf(document: InvoiceDocument): Promise<Uint8Array> {
	const { seller, customer } = document;
	const title = `Invoice ${document.printedNumber}`;
	const runningHeading = rowOf(`${title} from ${seller.name}, continued`, penStyles.muted);
	const sheet = await InvoicePdfSheet.open(title, seller.name, runningHeading);
	writeStamp(sheet, document);
	sheet.writeColumns(openingColumnsOf(document, title));
	sheet.space();
	sheet.writeFlowing({ rows: partyRowsOf('Billed to', customer), ...wholeWidth });
	sheet.space();
	writeLinesTable(sheet, document);
	sheet.writeColumns([{ rows: factRowsOf(owingFactsOf(document), penStyles.strong), ...rightHalf }]);
	writeClosing(sheet, document);
	return sheet.save();
}

function writeStamp(sheet: InvoicePdfSheet, document: InvoiceDocument): void {
	const stamp = documentStampOf(document);
	if (stamp === null) return;
	sheet.stamp(stamp.mark);
	sheet.writeColumns([{ rows: [rowOf(stamp.sentence, penStyles.signal)], ...wholeWidth }]);
	sheet.space();
}

/** The seller on the left; the invoice's number, dates and reference on the right. */
function openingColumnsOf(document: InvoiceDocument, title: string): TextColumn[] {
	const headingRows = [rowOf(title, penStyles.title), ...factRowsOf(headingFactsOf(document))];
	return [
		{ rows: partyRowsOf('From', document.seller), x: a4Page.margin, width: sellerWidth },
		{ rows: headingRows, x: a4Page.margin + sellerWidth, width: headingWidth, isRightAligned: true }
	];
}

function writeClosing(sheet: InvoicePdfSheet, document: InvoiceDocument): void {
	if (isSayingHowToPay(document)) {
		sheet.space();
		sheet.writeFlowing({ rows: howToPayRowsOf(document.howToPay), ...wholeWidth });
	}
	if (document.notes === '') return;
	sheet.space();
	sheet.writeFlowing({ rows: [rowOf(document.notes, penStyles.muted)], ...wholeWidth });
}
