import { draftInvoice } from '$lib/server/books/draftInvoice';
import { changeDraftInvoice } from '$lib/server/books/changeDraftInvoice';
import { deleteInvoice } from '$lib/server/books/deleteInvoice';
import { readInvoiceInFull } from './booksInvoiceReading';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { invoiceHeadingFields, invoiceIdField, invoiceLinesField } from './booksInvoiceFields';
import { keptRecordOfIt } from './describeBooksDeletions';
import type { McpAction } from '../actionTypes';

const draftOnlyWhatThePersonSaid =
	'Draft only what the person told you. The customer is the business they named: list_customer_balances gives its id, ' +
	'and create_customer adds one only when none there is that business. Each line is their description, quantity and ' +
	'price, never a figure you worked out or filled in. Every line needs an income account from read_chart_of_accounts: ' +
	'ask the person which when more than one could fit, and keep a line within a cost centre only when they say so. ' +
	'Leave the dates out for today and the payment terms, and leave out a reference or notes they did not give. A draft ' +
	'takes the next invoice number and posts nothing; read it back to the person as the answer gives it.';

const changeOnlyWhatThePersonAsked =
	'Give only what the person asked to change and leave the rest out, so the draft keeps it. lines takes the place of ' +
	'every line the draft holds: read_invoice first, then send every line that is to stay as it reads there, with only ' +
	'the change the person asked for. Only a draft can be changed; an issued invoice never is. Read the answer back.';

const deleteOnlyWhenThePersonSaysSo =
	'Delete an invoice only when the person says to. Only a draft or a void invoice is deleted; an issued or paid one ' +
	'has posted to the ledger and is voided instead. A void invoice keeps its journals in the ledger after it is deleted. ' +
	'A record of the invoice and its lines is kept, which list_books_deletions reads, so one deleted by mistake can be put back.';

export const booksInvoiceActions: McpAction[] = [
	moduleAction('books', {
		name: 'create_invoice',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "draft an invoice to one of an organisation's customers, with its lines, numbered in the organisation's own numbering",
		guidance: draftOnlyWhatThePersonSaid,
		inputSchema: objectSchema(
			{ organisationId: booksOrganisationField, ...invoiceHeadingFields, lines: invoiceLinesField },
			['organisationId', 'customerId', 'lines']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const invoiceId = await draftInvoice(caller.supabase, organisation.id, input);
				const invoice = await readInvoiceInFull(caller.supabase, organisation.id, invoiceId);
				return `Drafted in ${organisation.name}'s books; nothing is posted until it is issued.\n${invoice}`;
			})
	}),
	moduleAction('books', {
		name: 'update_draft_invoice',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "change one of an organisation's draft invoices: its customer, dates, reference, notes or lines",
		guidance: changeOnlyWhatThePersonAsked,
		inputSchema: objectSchema(
			{ organisationId: booksOrganisationField, invoiceId: invoiceIdField, ...invoiceHeadingFields, lines: invoiceLinesField },
			['organisationId', 'invoiceId']
		),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				await changeDraftInvoice(caller.supabase, organisation.id, input);
				const invoice = await readInvoiceInFull(caller.supabase, organisation.id, String(input.invoiceId));
				return `Saved. The draft now reads:\n${invoice}`;
			})
	}),
	moduleAction('books', {
		name: 'delete_invoice',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "delete one of an organisation's draft or void invoices",
		guidance: deleteOnlyWhenThePersonSaysSo,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, invoiceId: invoiceIdField }, ['organisationId', 'invoiceId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.deleting, async () => {
				const invoice = await deleteInvoice(caller.supabase, organisation.id, input.invoiceId, caller.accountId);
				const deleted = `Deleted ${invoice.status} invoice ${invoice.printedNumber} to ${invoice.customerName} from ${organisation.name}'s books.`;
				return `${deleted} ${keptRecordOfIt}`;
			})
	})
];
