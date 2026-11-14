import type { SupabaseClient } from '@supabase/supabase-js';
import type { CostRow } from '$lib/data/books/page/costRows';
import { findChartNamings, nameOf, type ChartNamings } from './chartNamings';
import { findExpenses, type Expense } from './expenses';

const isUnpaidOnly = false;

/** Every cost in the organisation's books, newest first, each named by the account it is coded to. */
export async function readCostRows(supabase: SupabaseClient, organisationId: string): Promise<CostRow[]> {
	const [expenses, namings] = await Promise.all([
		findExpenses(supabase, organisationId, isUnpaidOnly),
		findChartNamings(supabase, organisationId)
	]);
	return expenses.map((expense) => costRowOf(expense, namings));
}

function costRowOf(expense: Expense, namings: ChartNamings): CostRow {
	return {
		id: expense.id,
		date: expense.expenseDate,
		supplier: expense.supplier,
		what: expense.description,
		account: nameOf(namings.accountNames, expense.expenseAccountId),
		amount: expense.amount,
		paidOn: expense.paidOn
	};
}
