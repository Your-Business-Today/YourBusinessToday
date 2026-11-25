import { spendingOf } from '$lib/data/books/loanBudget/loanLineSpending';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { recordLoanSpend } from '$lib/server/books/saveLoanSpend';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { newLoanSpendFields } from './booksLoanBudgetFields';
import { describeLoanSpend } from './describeLoanBudgets';
import type { McpAction } from '../actionTypes';

const spendIsWhatWasSpent =
	'Record only money the person says was spent, against the line they name, with the cost in the books it matches when ' +
	'there is one. A line no director has approved, or one the spend would take past its amount, is refused: say so plainly.';

export const booksLoanSpendActions: McpAction[] = [
	moduleAction('books', {
		name: 'record_loan_spend',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: 'record money spent from a ring-fenced loan against an approved budget line: the day, how much and what it was',
		guidance: spendIsWhatWasSpent,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...newLoanSpendFields }, [
			'organisationId',
			'budgetLineId',
			'spentOn',
			'amount',
			'description'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const { spend, line } = await recordLoanSpend(caller.supabase, organisation.id, input);
				const left = formatPoundsAndPence(spendingOf(line).left);
				return `Recorded against ${line.purpose} in ${organisation.name}'s books:\n${describeLoanSpend(spend)}\n${left} is left on the line.`;
			})
	})
];
