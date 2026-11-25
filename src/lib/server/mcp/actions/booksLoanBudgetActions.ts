import { addLoanDraw } from '$lib/server/books/saveLoanDraw';
import { changeLoanBudget, openLoanBudget } from '$lib/server/books/saveLoanBudget';
import { findLoanBudget, findLoanBudgets } from '$lib/server/books/loanBudgets';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { loanBudgetChangeFields, newLoanBudgetFields, newLoanDrawFields } from './booksLoanBudgetFields';
import { describeLoanBudget, describeLoanBudgets } from './describeLoanBudgets';
import type { McpAction } from '../actionTypes';

const onlyWhatTheDirectorsAgreed =
	'Take every figure from the directors as they agreed it; never estimate one. The repayment shows on the Cashflow tab ' +
	'as money out each month it runs, and each draw as money in, so never add either again with add_cashflow_item.';

export const booksLoanBudgetActions: McpAction[] = [
	moduleAction('books', {
		name: 'read_loan_budgets',
		area: 'books',
		audience: 'everyone',
		isWrite: false,
		summary: "read the ring-fenced loan budgets in an organisation's books: each loan, its repayment, draws and lines, and who approved each line",
		guidance: 'Give each line as the books hold it, and say plainly which lines still await a director, as nothing may be spent from those.',
		inputSchema: objectSchema({ organisationId: booksOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.reading, async () =>
				describeLoanBudgets(organisation.name, await findLoanBudgets(caller.supabase, organisation.id))
			)
	}),
	moduleAction('books', {
		name: 'open_loan_budget',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "keep a ring-fenced loan in an organisation's books: how much, who it is repaid to and the monthly repayment",
		guidance: onlyWhatTheDirectorsAgreed,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...newLoanBudgetFields }, [
			'organisationId',
			'title',
			'loanAmount',
			'repaidTo',
			'monthlyRepayment',
			'firstRepaymentMonth',
			'repaymentMonths'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				const budget = await openLoanBudget(caller.supabase, organisation.id, input);
				return `Kept in ${organisation.name}'s books:\n${describeLoanBudget(budget)}`;
			})
	}),
	moduleAction('books', {
		name: 'update_loan_budget',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "change a loan budget in an organisation's books: its title, amount, who it is repaid to, the repayment or its notes",
		guidance: `Give only what the person asked to change. ${onlyWhatTheDirectorsAgreed}`,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...loanBudgetChangeFields }, ['organisationId', 'loanBudgetId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.changing, async () => {
				const { after } = await changeLoanBudget(caller.supabase, organisation.id, input);
				return `Changed in ${organisation.name}'s books. It now reads:\n${describeLoanBudget(after)}`;
			})
	}),
	moduleAction('books', {
		name: 'add_loan_draw',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: 'keep a part of a ring-fenced loan drawn, or to be drawn, into the bank in a month; it shows as money in on the Cashflow tab',
		guidance: onlyWhatTheDirectorsAgreed,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...newLoanDrawFields }, ['organisationId', 'loanBudgetId', 'month', 'amount']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.saving, async () => {
				await addLoanDraw(caller.supabase, organisation.id, input);
				const budget = await findLoanBudget(caller.supabase, organisation.id, input.loanBudgetId);
				return `Draw kept in ${organisation.name}'s books:\n${describeLoanBudget(budget)}`;
			})
	})
];
