import type { SupabaseClient } from '@supabase/supabase-js';
import type { CostShare, CostShareMember } from '$lib/data/books/sharing/costShare';
import { CostShareMembersBy, type CostShareMembersByChoice } from '$lib/data/books/sharing/costShareMembersBy';
import { equalWeight } from '$lib/data/books/sharing/costShareWeights';
import { CostShareSplitBy, type CostShareSplitByChoice } from '$lib/data/books/sharing/costShareUsage';
import { monthOfDay } from '$lib/data/books/monthKey';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { findLiveProjectMembers } from './costShareStatusMembers';
import { findUsageReadings } from './costShareUsageReadings';

export const CostShareTables = { shares: 'books_cost_shares', members: 'books_cost_share_members' } as const;
export const costShareColumns = 'id, cost_centre_id, months_covered, members_by, split_by';
export const costShareMemberColumns = 'id, cost_share_id, project_id, joined_month, left_month, weight, cost_centre_id, directors_loan_account_id';

export type CostShareRow = {
	id: string;
	cost_centre_id: string;
	months_covered: number;
	members_by: CostShareMembersByChoice;
	split_by?: CostShareSplitByChoice;
};
export type CostShareMemberRow = {
	id: string;
	cost_share_id: string;
	project_id: string | null;
	joined_month: string;
	left_month: string | null;
	weight?: number | string;
	cost_centre_id?: string | null;
	directors_loan_account_id?: string | null;
};

/**
 * Every shared cost in the organisation's books with the projects that share it, by the month each joined: its named
 * members, or every project live each month for one kept by rule, beside any cost centres named; none until the migration has run.
 */
export async function findCostShares(supabase: SupabaseClient, organisationId: string): Promise<CostShare[]> {
	const [shares, members] = await Promise.all([
		supabase.from(CostShareTables.shares).select(costShareColumns).eq('organisation_id', organisationId),
		supabase.from(CostShareTables.members).select(costShareMemberColumns).eq('organisation_id', organisationId).order('joined_month')
	]);
	const error = shares.error ?? members.error;
	if (error !== null && isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	const shareRows = shares.data as CostShareRow[];
	const isAnyByRule = shareRows.some(isKeptByRule);
	const liveMembers = isAnyByRule ? await findLiveProjectMembers(supabase, organisationId) : [];
	const memberRows = members.data as CostShareMemberRow[];
	const usage = await findUsageReadings(supabase, organisationId, shareRows);
	return shareRows.map((row) => {
		const named = fromCostShareRow(row, memberRows);
		const costCentreMembers = named.members.filter((member) => member.costCentreId !== null);
		const share = isKeptByRule(row) ? { ...named, members: [...liveMembers, ...costCentreMembers] } : named;
		return { ...share, usage: usage.get(row.id) };
	});
}

export function fromCostShareRow(row: CostShareRow, memberRows: CostShareMemberRow[]): CostShare {
	const members = memberRows.filter((member) => member.cost_share_id === row.id).map(fromCostShareMemberRow);
	const membersBy = row.members_by ?? CostShareMembersBy.named;
	const splitBy = row.split_by ?? CostShareSplitBy.weight;
	return { id: row.id, costCentreId: row.cost_centre_id, monthsCovered: row.months_covered, membersBy, members, splitBy };
}

export function fromCostShareMemberRow(row: CostShareMemberRow): CostShareMember {
	const leftMonth = row.left_month === null ? null : monthOfDay(row.left_month);
	const weight = row.weight === undefined ? equalWeight : Number(row.weight);
	const costCentreId = row.cost_centre_id ?? null;
	const directorsLoanAccountId = row.directors_loan_account_id ?? null;
	const joinedMonth = monthOfDay(row.joined_month);
	return { id: row.id, projectId: row.project_id, joinedMonth, leftMonth, weight, costCentreId, directorsLoanAccountId };
}

function isKeptByRule(row: CostShareRow): boolean {
	return row.members_by === CostShareMembersBy.liveProjects;
}
