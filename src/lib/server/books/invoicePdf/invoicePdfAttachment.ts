import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { invoicePdfFilenameOf } from '$lib/data/books/invoicePdfFilename';
import type { EmailAttachment } from '$lib/server/email/sendTransactionalEmail';
import { drawInvoicePdf } from './drawInvoicePdf';

/** The invoice's PDF as the email carries it, named for its printed number. */
export async function invoicePdfAttachmentOf(document: InvoiceDocument): Promise<EmailAttachment> {
	const pdf = await drawInvoicePdf(document);
	return { filename: invoicePdfFilenameOf(document), content: Buffer.from(pdf).toString('base64') };
}
