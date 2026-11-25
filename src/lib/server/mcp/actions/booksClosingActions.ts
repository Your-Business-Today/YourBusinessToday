import { ukClockAt } from '$lib/data/ukClock';
import { describeMonth } from '$lib/data/books/monthKey';
import { findLatestClose } from '$lib/server/books/booksClosing';
import { closeBooksToMonth } from '$lib/server/books/closeBooks';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, textField } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import type { McpAction } from '../actionTypes';

const todayOnUkClock = (): string => ukClockAt(new Date()).date;

const closingGuidance =
	'Only a sitting director closes the books, and only up to a month that has ended. Closing keeps each shared cost’s split for every month it closes ' +
	'as it stands: from then on a project joining or leaving, a status change, or a line dated into a closed month counts from the first open month, ' +
	'so closed months are never rewritten. A close never moves back, so ask the person before closing and say the month it closes to.';

export const booksClosingActions: McpAction[] = [
	moduleAction('books', {
		name: 'close_books_to_month',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "close an organisation's books up to the end of a month, keeping each shared cost's split for the months closed as it stands",
		guidance: closingGuidance,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, month: textField('The last month to close, one that has ended, written as 2026-10') }, [
			'organisationId',
			'month'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const closed = await closeBooksToMonth(caller.supabase, organisation.id, input.month, { accountId: caller.accountId }, todayOnUkClock());
				const kept = `${closed.keptPartCount} shared cost part(s) kept as they stand`;
				return `${organisation.name}'s books are closed to the end of ${describeMonth(closed.closedTo)} by ${closed.closedByName}; ${kept}.`;
			})
	}),
	moduleAction('books', {
		name: 'read_books_closing',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read the month an organisation's books are closed to, who closed them and when",
		guidance: closingGuidance,
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () => {
				const latest = await findLatestClose(caller.supabase, organisation.id);
				if (latest === null) return `${organisation.name}'s books have never been closed; every month is open.`;
				const closedTo = describeMonth(latest.closed_to_month.slice(0, 7));
				return `${organisation.name}'s books are closed to the end of ${closedTo}, by ${latest.closed_by_name} at ${latest.closed_at}.`;
			})
	})
];
