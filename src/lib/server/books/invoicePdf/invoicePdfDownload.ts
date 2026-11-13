import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { invoicePdfFilenameOf } from '$lib/data/books/invoicePdfFilename';
import { attachmentResponse } from '$lib/server/clientDocuments/attachmentResponse';
import { drawInvoicePdf } from './drawInvoicePdf';

const pdfContentType = 'application/pdf';

/** The invoice's PDF as a download, named for its printed number. */
export async function invoicePdfDownloadOf(document: InvoiceDocument): Promise<Response> {
	const pdf = await drawInvoicePdf(document);
	return attachmentResponse(pdf, invoicePdfFilenameOf(document), pdfContentType);
}
