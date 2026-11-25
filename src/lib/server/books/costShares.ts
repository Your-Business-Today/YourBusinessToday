import type { SupabaseClient } from '@supabase/supabase-js';
import type { CostShare, CostShareMember } from '$lib/data/books/sharing/costShare';
import { monthOfDay } from '$lib/data/books/monthKey';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

export const CostShareTables = { shares: 'books_cost_shares', members: 'books_cost_share_members' } as const;

export const costShareColumns = 'id, cost_centre_id, months_covered';

export const costShareMemberColumns = 'id, cost_share_id, project_id, joined_month, left_month';

export type CostShareRow = { id: string; cost_centre_id: string; months_covered: number };

export type CostShareMemberRow = { id: string; cost_share_id: string; project_id: string | null; joined_month: string; left_month: string | null };

/** Every shared cost in the organisation's books with the projects that share it, by the month each joined; none until the migration that keeps them has run. */
export async function findCostShares(supabase: SupabaseClient, organisationId: string): Promise<CostShare[]> {
	const [shares, members] = await Promise.all([
		supabase.from(CostShareTables.shares).select(costShareColumns).eq('organisation_id', organisationId),
		supabase.from(CostShareTables.members).select(costShareMemberColumns).eq('organisation_id', organisationId).order('joined_month')
	]);
	const error = shares.error ?? members.error;
	if (error !== null && isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	const memberRows = members.data as CostShareMemberRow[];
	return (shares.data as CostShareRow[]).map((row) => fromCostShareRow(row, memberRows));
}

export function fromCostShareRow(row: CostShareRow, memberRows: CostShareMemberRow[]): CostShare {
	const members = memberRows.filter((member) => member.cost_share_id === row.id).map(fromCostShareMemberRow);
	return { id: row.id, costCentreId: row.cost_centre_id, monthsCovered: row.months_covered, members };
}

export function fromCostShareMemberRow(row: CostShareMemberRow): CostShareMember {
	const leftMonth = row.left_month === null ? null : monthOfDay(row.left_month);
	return { id: row.id, projectId: row.project_id, joinedMonth: monthOfDay(row.joined_month), leftMonth };
}
