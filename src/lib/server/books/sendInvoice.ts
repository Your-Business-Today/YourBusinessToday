import type { SupabaseClient } from '@supabase/supabase-js';
import type { DocumentParty, InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { noRecipientRefusal, recipientOf, sendingStatusRefusal, sendToRefusal } from '$lib/data/books/invoiceSendingRules';
import { validateRecordId } from '$lib/data/isUuid';
import type { EmailDelivery } from '$lib/data/emailDelivery';
import { portalAddress } from '$lib/portal/portalAddress';
import { portalBilledInvoicePath } from '$lib/portal/portalPaths';
import { invoiceEmailSubject, renderInvoiceEmail } from '$lib/server/email/invoiceEmail';
import { sendTransactionalEmail, type TransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findCustomer } from './customers';
import { findInvoiceDocument } from './invoiceDocument';
import { findInvoiceHeader } from './invoices';
import { keepInvoiceSending } from './invoiceSendings';

/** Which invoice to email, where to, and who asked: a person's account, or none for a run that sends by itself. */
export type InvoiceSendingRequest = { organisationId: string; invoiceId: unknown; to: unknown; sentByAccountId: string | null };

/** What became of the email: the invoice as printed, where it went, the copy kept, and whether it went. */
export type InvoiceSendingOutcome = { invoiceId: string; printedNumber: string; sentTo: string; copiedTo: string | null; delivery: EmailDelivery };

/**
 * Emails an issued or paid invoice to its customer, or to the address given, through the site's own sender, with
 * replies and a copy going to the books' company email, and keeps the sending whatever became of the email.
 */
export async function sendInvoice(supabase: SupabaseClient, request: InvoiceSendingRequest): Promise<InvoiceSendingOutcome> {
	const invoiceId = String(request.invoiceId ?? '');
	refuseWhen(validateRecordId('invoice', invoiceId));
	refuseWhen(sendToRefusal(request.to));
	const document = await findInvoiceDocument(supabase, request.organisationId, invoiceId);
	if (document === null) throw new BooksRefusal(`No invoice ${invoiceId} is in this organisation's books; list_invoices lists them.`);
	refuseWhen(sendingStatusRefusal(document.printedNumber, document.status));
	const sentTo = recipientOf(request.to, document.customer);
	refuseWhen(noRecipientRefusal(document.printedNumber, document.customer, sentTo));
	const email = await invoiceEmailOf(supabase, request.organisationId, document, sentTo);
	const delivery = await sendTransactionalEmail(email);
	await keepInvoiceSending(supabase, { organisationId: request.organisationId, invoiceId, sentTo, delivery, sentByAccountId: request.sentByAccountId });
	return { invoiceId, printedNumber: document.printedNumber, sentTo, copiedTo: email.bcc ?? null, delivery };
}

async function invoiceEmailOf(supabase: SupabaseClient, organisationId: string, document: InvoiceDocument, sentTo: string): Promise<TransactionalEmail> {
	const portalUrl = await portalUrlOf(supabase, organisationId, document.invoiceId);
	const email = { to: sentTo, subject: invoiceEmailSubject(document), html: renderInvoiceEmail({ document, portalUrl }) };
	return { ...email, ...sellersCopyOf(document.seller) };
}

/** Replies and a copy go to the seller's company email in the books, when they keep one. */
function sellersCopyOf(seller: DocumentParty): Pick<TransactionalEmail, 'replyTo' | 'bcc'> {
	if (seller.email === '') return {};
	return { replyTo: seller.email, bcc: seller.email };
}

/** The invoice in the portal's Billing, when its customer is a client on the register; only Your Business Today's own books link one. */
async function portalUrlOf(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<string | null> {
	const header = await findInvoiceHeader(supabase, organisationId, invoiceId);
	if (header === null) return null;
	const customer = await findCustomer(supabase, organisationId, header.customerId);
	const clientId = customer?.clientId ?? null;
	if (clientId === null) return null;
	return `${portalAddress.origin}${portalBilledInvoicePath(invoiceId)}`;
}
