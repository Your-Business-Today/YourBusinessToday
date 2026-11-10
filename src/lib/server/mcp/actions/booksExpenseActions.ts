import { recordExpense } from '$lib/server/books/recordExpense';
import { payExpense } from '$lib/server/books/payExpense';
import { deleteExpense } from '$lib/server/books/deleteExpense';
import { findChartNamings } from '$lib/server/books/chartNamings';
import { formatBritishDate } from '$lib/data/britishDate';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { answerOrRefusal, booksRefusalOpenings } from './booksAnswer';
import { booksOrganisationField } from './booksFields';
import { costPaymentFields, expenseFields, expenseIdField } from './booksExpenseFields';
import { describeExpense } from './describeExpenses';
import { keptRecordOf } from './describeBooksDeletions';
import type { McpAction } from '../actionTypes';

const recordOnlyWhatThePersonSaid =
	'Record only the cost the person told you about: the supplier they named, the day and the amount they gave, never a ' +
	'figure you worked out or a detail you filled in. Code it to the expense account they chose from read_chart_of_accounts, ' +
	'asking which when more than one could fit, and keep it within a cost centre only when they say so. Something paid up ' +
	'front for several months goes to Prepayments (1300). Say isPaid only when they said it has been paid already: it then ' +
	'posts against the bank; otherwise it is owed to the supplier on trade creditors until pay_expense settles it.';

const payOnlyWhenThePersonSaysSo =
	'Mark a cost paid only when the person says it has been paid, with the day they gave. The payment posts off trade ' +
	'creditors and out of the bank for the whole cost; a cost paid already is refused.';

const deleteOnlyAMistake =
	'Delete a cost only when the person says it was recorded by mistake. It takes the cost out with every journal it ' +
	'posted, its recording and its payment; a cost that was real is never deleted, so ask before deleting one that is paid. ' +
	'A record of the cost and those journals is kept, which list_books_deletions reads, so one deleted by mistake can be put back.';

export const booksExpenseActions: McpAction[] = [
	moduleAction('books', {
		name: 'record_expense',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "record a cost from a supplier in an organisation's books, posting it to the ledger, paid or still owed",
		guidance: recordOnlyWhatThePersonSaid,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...expenseFields }, [
			'organisationId',
			'expenseDate',
			'supplier',
			'amount',
			'expenseAccountId'
		]),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const expense = await recordExpense(caller.supabase, organisation.id, input);
				const namings = await findChartNamings(caller.supabase, organisation.id);
				const settled = expense.paidOn === null ? 'owed to the supplier on trade creditors' : 'paid from the bank';
				return `Recorded the cost in ${organisation.name}'s books and posted it, ${settled}:\n${describeExpense(expense, namings)}`;
			})
	}),
	moduleAction('books', {
		name: 'pay_expense',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "mark one of an organisation's unpaid costs paid from the bank, posting the payment to its ledger",
		guidance: payOnlyWhenThePersonSaysSo,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, ...costPaymentFields }, ['organisationId', 'expenseId', 'paidOn']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.posting, async () => {
				const paid = await payExpense(caller.supabase, organisation.id, input);
				const namings = await findChartNamings(caller.supabase, organisation.id);
				const marked = `Marked the cost paid on ${formatBritishDate(paid.paidOn)} and posted the payment from the bank`;
				return `${marked} in ${organisation.name}'s books:\n${describeExpense(paid, namings)}`;
			})
	}),
	moduleAction('books', {
		name: 'delete_expense',
		area: 'books',
		audience: 'everyone',
		isWrite: true,
		summary: "delete a cost recorded by mistake from an organisation's books, with the journals it posted",
		guidance: deleteOnlyAMistake,
		inputSchema: objectSchema({ organisationId: booksOrganisationField, expenseId: expenseIdField }, ['organisationId', 'expenseId']),
		run: async (caller, input, organisation) =>
			answerOrRefusal(booksRefusalOpenings.deleting, async () => {
				const expense = await deleteExpense(caller.supabase, organisation.id, input.expenseId, caller.accountId);
				const cost = `the cost from ${expense.supplier} dated ${formatBritishDate(expense.expenseDate)}`;
				return `Deleted ${cost} from ${organisation.name}'s books, with the journals it posted. ${keptRecordOf(expense.deletionId)}`;
			})
	})
];
