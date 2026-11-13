import { longestLineDescription } from '$lib/data/books/journalLineDescription';
import { textField } from '../actionTypes';

export const booksOrganisationField = textField(
	'The organisation whose books these are, as list_organisations gives it; Books must be switched on for it'
);

export const asAtField = textField('The day the reading is taken at the end of, written as 2026-11-30');

export const overviewMonthField = textField('Leave out for this month, or the month to read, written as 2026-11');

export const periodStartField = textField('The first day of the period, written as 2026-11-01');

export const periodEndField = textField('The last day of the period, written as 2026-11-30');

export const costCentreIdField = textField(
	'Leave out for the whole organisation, or narrow to one cost centre by its id, as read_chart_of_accounts or list_cost_centres gives it'
);

const journalLineField = {
	type: 'object',
	properties: {
		accountId: textField('The account the line posts to, by its id as read_chart_of_accounts gives it'),
		costCentreId: textField('Leave out, or keep the line within one cost centre by its id'),
		debit: { type: 'number', description: 'The amount in pounds on the debit side, such as 120.50; leave out for a credit line' },
		credit: { type: 'number', description: 'The amount in pounds on the credit side, such as 120.50; leave out for a debit line' },
		description: textField(
			`Leave out for the journal's own description, or what this line was, in the person's words, at most ${longestLineDescription} characters`
		)
	},
	required: ['accountId'],
	additionalProperties: false
};

export const journalFields = {
	journalDate: textField('The day the journal is dated, written as 2026-11-30'),
	description: textField('What the journal is for, in the words the person gave'),
	reversesJournalId: textField('Leave out, or the id of the journal this one reverses, when it undoes a journal posted in error'),
	lines: {
		type: 'array',
		description: 'At least two lines, each a debit or a credit on one account; the debits must equal the credits',
		items: journalLineField
	}
};

export const booksDeletionIdField = textField('The deletion, by its id as list_books_deletions gives it');
