import { readBooksOverview } from '$lib/server/books/booksOverview';
import { findInvoiceNamings } from '$lib/server/books/invoiceNamings';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField, overviewMonthField } from './booksFields';
import { describeBooksOverview } from './describeBooksOverview';
import type { McpAction } from '../actionTypes';

const frontPageAsTheBooksHoldIt =
	'Read this first when the person asks how the books stand. Give them the figures as the books hold them, never rounded, ' +
	'estimated or added up yourself. The bank, what customers owe and what is owed to suppliers stand at the end of the month; ' +
	'to say what makes one up, call explain_account_balance for its account. The unpaid invoices are those issued and not yet ' +
	'paid today, each with its id for read_invoice or record_invoice_payment.';

export const booksOverviewActions: McpAction[] = [
	moduleAction('books', {
		name: 'read_books_overview',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary:
			"read how an organisation's books stand: the bank, what customers owe, what it owes suppliers, the month's income " +
			'and costs, and the invoices still unpaid',
		guidance: frontPageAsTheBooksHoldIt,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, monthKey: overviewMonthField }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const overview = await readBooksOverview(caller.supabase, organisation.id, input.monthKey);
				const namings = await findInvoiceNamings(caller.supabase, organisation.id);
				return describeBooksOverview(organisation.name, overview, namings);
			})
	})
];
