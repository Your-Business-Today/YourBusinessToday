import type { SupabaseClient } from '@supabase/supabase-js';
import { findChartNamings, type ChartNamings } from './chartNamings';
import { loanAccountsTable } from './loanAccounts';

/** What the chart's accounts and cost centres are called, and who each loan account belongs to, so a cost reads as known. */
export type CostNamings = ChartNamings & { payerNames: Map<string, string> };

type LoanPersonRow = { id: string; person_name: string };

/** The chart's namings, with each loan account named by the person who pays costs from it. */
export async function findCostNamings(supabase: SupabaseClient, organisationId: string): Promise<CostNamings> {
	const [chart, loans] = await Promise.all([
		findChartNamings(supabase, organisationId),
		supabase.from(loanAccountsTable).select('id, person_name').eq('organisation_id', organisationId)
	]);
	if (loans.error !== null) throw loans.error;
	const people = (loans.data ?? []) as LoanPersonRow[];
	return { ...chart, payerNames: new Map(people.map((loan) => [loan.id, loan.person_name])) };
}
