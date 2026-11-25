import type { SupabaseClient } from '@supabase/supabase-js';
import { monthOfDay, monthStart, type MonthKey } from '$lib/data/books/monthKey';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

export const costShareLoanPostingsTable = 'books_cost_share_loan_postings';

/** The journal that moved a member's part of a shared cost in a month onto its director's loan, and how much it moved. */
export type CostShareLoanPosting = { memberId: string; month: MonthKey; journalId: string; amount: number };

type LoanPostingRow = { cost_share_member_id: string; month: string; journal_id: string; amount: number | string };

/** Every month's part already moved onto a director's loan in the organisation's books; none until the migration has run. */
export async function findLoanPostings(supabase: SupabaseClient, organisationId: string): Promise<CostShareLoanPosting[]> {
	const { data, error } = await supabase
		.from(costShareLoanPostingsTable)
		.select('cost_share_member_id, month, journal_id, amount')
		.eq('organisation_id', organisationId);
	if (error !== null && isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return (data as LoanPostingRow[]).map((row) => ({
		memberId: row.cost_share_member_id,
		month: monthOfDay(row.month),
		journalId: row.journal_id,
		amount: Number(row.amount)
	}));
}

/** Claims the month for the member before its journal posts, so it is never moved twice; false when it was already claimed. */
export async function claimLoanPosting(supabase: SupabaseClient, organisationId: string, posting: CostShareLoanPosting): Promise<boolean> {
	const row = {
		organisation_id: organisationId,
		cost_share_member_id: posting.memberId,
		month: monthStart(posting.month),
		journal_id: posting.journalId,
		amount: posting.amount
	};
	const { error } = await supabase.from(costShareLoanPostingsTable).insert(row);
	const uniqueViolation = '23505';
	if (error?.code === uniqueViolation) return false;
	if (error !== null) throw error;
	return true;
}

/** Gives the claim up when its journal could not be posted, so the month can be moved again. */
export async function releaseLoanPosting(supabase: SupabaseClient, organisationId: string, journalId: string): Promise<void> {
	const { error } = await supabase.from(costShareLoanPostingsTable).delete().eq('organisation_id', organisationId).eq('journal_id', journalId);
	if (error !== null) throw error;
}
