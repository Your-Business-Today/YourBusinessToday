import type { InvoiceDocument } from './invoiceDocument';

/** The file an invoice is attached and downloaded as: its printed number, such as INV-7.pdf. */
export function invoicePdfFilenameOf(document: Pick<InvoiceDocument, 'printedNumber'>): string {
	return `${document.printedNumber}.pdf`;
}
