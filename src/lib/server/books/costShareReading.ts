import type { SupabaseClient } from '@supabase/supabase-js';
import { monthOfDay, validateMonthKey, type MonthKey } from '$lib/data/books/monthKey';
import type { CostShare } from '$lib/data/books/sharing/costShare';
import { costShareSplit, twelveMonthsTo, type CostShareMonth } from '$lib/data/books/sharing/costShareSplit';
import { BooksRefusal } from './booksRefusal';
import { readSharedLedgerUpTo } from './sharedLedgerEntries';
import { findLoanPostings, type CostShareLoanPosting } from './costShareLoanMovedMonths';

/** One shared cost with the names it is read by, and how its lines were split month by month. */
export type CostShareReading = { share: CostShare; label: string; months: CostShareMonth[] };

/** Every shared cost to the day, each with its twelve months to the month asked for; the names of the cost centres and projects they reach. */
export type CostSharesReading = {
	toMonth: MonthKey;
	shares: CostShareReading[];
	costCentreLabels: Map<string, string>;
	projectNames: Map<string, string>;
	loanPostings: CostShareLoanPosting[];
};

/** Every shared cost of the organisation, its members, and what each project took of it in each of the twelve months to toMonth. */
export async function readCostShares(supabase: SupabaseClient, organisationId: string, today: string, toMonth: unknown): Promise<CostSharesReading> {
	const lastMonth = toMonth === undefined || toMonth === null || toMonth === '' ? monthOfDay(today) : toMonth;
	const refusal = validateMonthKey('toMonth', lastMonth);
	if (refusal !== null) throw new BooksRefusal(refusal);
	const months = twelveMonthsTo(lastMonth as MonthKey);
	const { entries, costCentres, shares } = await readSharedLedgerUpTo(supabase, organisationId, today);
	const costCentreLabels = new Map(costCentres.map((costCentre) => [costCentre.id, costCentre.label]));
	const readings = shares.map((share) => ({
		share,
		label: costCentreLabels.get(share.costCentreId) ?? share.costCentreId,
		months: costShareSplit(entries, share, months)
	}));
	const [projectNames, loanPostings] = await Promise.all([findProjectNames(supabase, shares), findLoanPostings(supabase, organisationId)]);
	return { toMonth: lastMonth as MonthKey, shares: readings, costCentreLabels, projectNames, loanPostings };
}

async function findProjectNames(supabase: SupabaseClient, shares: CostShare[]): Promise<Map<string, string>> {
	const projectIds = [...new Set(shares.flatMap((share) => share.members.map((member) => member.projectId)).filter((id) => id !== null))];
	if (projectIds.length === 0) return new Map();
	const { data, error } = await supabase.from('projects').select('id, name').in('id', projectIds);
	if (error !== null) throw error;
	return new Map((data as { id: string; name: string }[]).map((project) => [project.id, project.name]));
}
