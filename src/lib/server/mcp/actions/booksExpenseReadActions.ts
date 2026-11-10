import { findExpenses } from '$lib/server/books/expenses';
import { findChartNamings } from '$lib/server/books/chartNamings';
import { refuseWhen } from '$lib/server/books/booksRefusal';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { unpaidOnlyField } from './booksExpenseFields';
import { describeExpenseList } from './describeExpenses';
import type { McpAction } from '../actionTypes';

const asTheBooksHoldThem =
	'The newest cost comes first. Use it to find the cost the person means before marking it paid or deleting it, and give ' +
	'them the figures as the books hold them, never a total you worked out yourself.';

export const booksExpenseReadActions: McpAction[] = [
	moduleAction('books', {
		name: 'list_expenses',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "list an organisation's costs from suppliers, newest first, showing which are still unpaid and what they come to",
		guidance: asTheBooksHoldThem,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, isUnpaidOnly: unpaidOnlyField }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				refuseWhen(unpaidOnlyRefusal(input.isUnpaidOnly));
				const [expenses, namings] = await Promise.all([
					findExpenses(caller.supabase, organisation.id, input.isUnpaidOnly === true),
					findChartNamings(caller.supabase, organisation.id)
				]);
				return describeExpenseList(organisation.name, expenses, namings);
			})
	})
];

function unpaidOnlyRefusal(isUnpaidOnly: unknown): string | null {
	if (isUnpaidOnly === undefined || typeof isUnpaidOnly === 'boolean') return null;
	return `isUnpaidOnly is true or false; ${JSON.stringify(isUnpaidOnly)} was given.`;
}
