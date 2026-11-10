import { isInvoiceStatus, invoiceStatusNames } from '$lib/data/books/invoiceStatuses';
import { validateRecordId } from '$lib/data/isUuid';
import { refuseWhen } from '$lib/server/books/booksRefusal';
import { findInvoiceSummaries, type InvoiceFilter } from '$lib/server/books/invoices';
import { findInvoiceNamings } from '$lib/server/books/invoiceNamings';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { invoiceFilterFields, invoiceIdField } from './booksInvoiceFields';
import { readInvoiceInFull } from './booksInvoiceReading';
import { describeInvoiceList } from './describeInvoices';
import type { McpAction } from '../actionTypes';

const figuresAsTheBooksHoldThem =
	'Give the person the invoice as the books hold it: its number, customer, dates, every line and its totals. Never ' +
	'work a figure out yourself; a draft is not yet owed, and an issued one owes its total less what has been paid.';

const newestFirst =
	'The newest invoice comes first. Use it to find the invoice the person means before reading or changing it, and give ' +
	'them the figures as the books hold them; a draft is not yet owed.';

export const booksInvoiceReadActions: McpAction[] = [
	moduleAction('books', {
		name: 'read_invoice',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read one of an organisation's invoices in full: its customer, dates, lines with their accounts, payments, totals and what is owed",
		guidance: figuresAsTheBooksHoldThem,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, invoiceId: invoiceIdField }, ['organisationId', 'invoiceId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				refuseWhen(validateRecordId('invoice', String(input.invoiceId ?? '')));
				return readInvoiceInFull(caller.supabase, organisation.id, input.invoiceId as string);
			})
	}),
	moduleAction('books', {
		name: 'list_invoices',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list an organisation's invoices, newest first, with each one's customer, status, dates, total and what is owed",
		guidance: newestFirst,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...invoiceFilterFields }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const filter = validatedFilter(input);
				const [invoices, namings] = await Promise.all([
					findInvoiceSummaries(caller.supabase, organisation.id, filter),
					findInvoiceNamings(caller.supabase, organisation.id)
				]);
				return describeInvoiceList(organisation.name, invoices, namings);
			})
	})
];

function validatedFilter(input: Record<string, unknown>): InvoiceFilter {
	const customerId = (input.customerId ?? null) as string | null;
	const status = input.status ?? null;
	refuseWhen(customerFilterRefusal(customerId));
	refuseWhen(statusFilterRefusal(status));
	return { customerId, status: status as InvoiceFilter['status'] };
}

function customerFilterRefusal(customerId: string | null): string | null {
	if (customerId === null) return null;
	return validateRecordId('customer', String(customerId));
}

function statusFilterRefusal(status: unknown): string | null {
	const isLeftOutOrKnown = status === null || isInvoiceStatus(status);
	if (isLeftOutOrKnown) return null;
	return `status is one of ${invoiceStatusNames.join(', ')}; ${JSON.stringify(status)} was given.`;
}
