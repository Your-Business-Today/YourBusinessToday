import type { SupabaseClient } from '@supabase/supabase-js';
import { findCostNamings } from '$lib/server/books/costNamings';
import type { Expense } from '$lib/server/books/expenses';
import { recordExpense } from '$lib/server/books/recordExpense';
import { recordExpensePaidPersonally } from '$lib/server/books/recordExpensePaidPersonally';
import { describeExpense } from './describeExpenses';

type BooksOrganisation = { id: string; name: string };

type RecordedCost = { recorded: Expense; settled: string };

/** Records the cost as the person gave it and says where it was posted: owed, paid from the bank, or paid by a person. */
export async function recordCostInWords(supabase: SupabaseClient, organisation: BooksOrganisation, input: Record<string, unknown>): Promise<string> {
	const { recorded, settled } = await recordCostAsGiven(supabase, organisation.id, input);
	const namings = await findCostNamings(supabase, organisation.id);
	return `Recorded the cost in ${organisation.name}'s books and posted it, ${settled}:\n${describeExpense(recorded, namings)}`;
}

async function recordCostAsGiven(supabase: SupabaseClient, organisationId: string, input: Record<string, unknown>): Promise<RecordedCost> {
	const isPaidPersonally = input.paidByLoanAccountId !== undefined;
	if (isPaidPersonally) return recordCostPaidPersonally(supabase, organisationId, input);
	const recorded = await recordExpense(supabase, organisationId, input);
	const settled = recorded.paidOn === null ? 'owed to the supplier on trade creditors' : 'paid from the bank';
	return { recorded, settled };
}

async function recordCostPaidPersonally(supabase: SupabaseClient, organisationId: string, input: Record<string, unknown>): Promise<RecordedCost> {
	const { recorded, loan } = await recordExpensePaidPersonally(supabase, organisationId, input);
	const loanAccount = `${loan.accountCode} ${loan.accountName}`;
	return { recorded, settled: `paid personally by ${loan.personName} and credited to their loan account, ${loanAccount}` };
}
