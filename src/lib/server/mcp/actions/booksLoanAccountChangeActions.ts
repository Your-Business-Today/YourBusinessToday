import { ukClockAt } from '$lib/data/ukClock';
import { changeLoanAccount } from '$lib/server/books/changeLoanAccount';
import { readLoanStatement } from '$lib/server/books/loanStatements';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { loanAccountChangeFields } from './booksLoanAccountFields';
import { describeLoanAccountCorrection } from './describeLoanAccountCorrection';
import type { McpAction } from '../actionTypes';

const correctOnlyWhatThePersonAsked =
	'Give only what the person asked to change: a name spelt wrong, how they now stand, or isClosed true for a loan that is ' +
	'settled and false to open it again. An account closes only at nil today; nothing is posted. Read the answer back.';

export const booksLoanAccountChangeActions: McpAction[] = [
	moduleAction('books', {
		name: 'update_loan_account',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "correct a loan account in an organisation's books: the person's name, how they stand to the company, or close or open it again",
		guidance: correctOnlyWhatThePersonAsked,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...loanAccountChangeFields }, ['organisationId', 'loanAccountId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.changing, async () => {
				const today = ukClockAt(new Date()).date;
				const correction = await changeLoanAccount(caller.supabase, organisation.id, input, today);
				const { balance } = await readLoanStatement(caller.supabase, organisation.id, correction.after, today);
				return describeLoanAccountCorrection(organisation.name, correction, balance);
			})
	})
];
