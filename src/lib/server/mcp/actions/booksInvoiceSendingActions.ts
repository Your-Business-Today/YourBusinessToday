import type { EmailDelivery } from '$lib/data/emailDelivery';
import { sendInvoice, type InvoiceSendingOutcome } from '$lib/server/books/sendInvoice';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { invoiceIdField, invoiceSendToField } from './booksInvoiceFields';
import { readInvoiceInFull } from './booksInvoiceReading';
import type { McpAction } from '../actionTypes';

const sendOnlyWhenThePersonSaysSo =
	'Send an invoice only when the person says to, after reading it back to them with read_invoice: it emails the ' +
	'customer the invoice as a document with its PDF attached, and every sending is kept. Send it again only when they ask; read_invoice lists ' +
	'when it went.';

const outcomeSentences: Record<EmailDelivery, (outcome: InvoiceSendingOutcome) => string> = {
	sent: (outcome) => `Sent invoice ${outcome.printedNumber}, with its PDF, to ${outcome.sentTo}${copySentence(outcome.copiedTo)}.`,
	skipped: (outcome) => `Email is not set up here, so invoice ${outcome.printedNumber} was not sent to ${outcome.sentTo}; the attempt is kept as skipped.`,
	failed: (outcome) => `The email of invoice ${outcome.printedNumber} to ${outcome.sentTo} could not be sent; the attempt is kept as failed. Try again later.`
};

export const booksInvoiceSendingActions: McpAction[] = [
	moduleAction('books', {
		name: 'send_invoice',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "email one of an organisation's issued invoices to its customer, keeping when it went",
		guidance: sendOnlyWhenThePersonSaysSo,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, invoiceId: invoiceIdField, to: invoiceSendToField }, [
			'organisationId',
			'invoiceId'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.sending, async () => {
				const request = { organisationId: organisation.id, invoiceId: input.invoiceId, to: input.to, sentByAccountId: caller.accountId };
				const outcome = await sendInvoice(caller.supabase, request);
				const reading = await readInvoiceInFull(caller.supabase, organisation.id, outcome.invoiceId);
				return `${outcomeSentences[outcome.delivery](outcome)}\n${reading}`;
			})
	})
];

function copySentence(copiedTo: string | null): string {
	if (copiedTo === null) return '';
	return `; a copy went to ${copiedTo}, where replies go`;
}
