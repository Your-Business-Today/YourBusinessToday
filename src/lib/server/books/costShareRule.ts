import type { SupabaseClient } from '@supabase/supabase-js';
import type { CostShareMembersByChoice } from '$lib/data/books/sharing/costShareMembersBy';
import { membersByRefusal } from '$lib/data/books/sharing/costShareMembersBy';
import { refuseWhen } from './booksRefusal';
import { CostShareTables, costShareColumns, type CostShareRow } from './costShares';
import { findCostShare } from './costShareWrites';

/** Sets how a shared cost finds its projects: its named members, or every project live each month; every month is read again by the choice. */
export async function setCostShareMembersBy(supabase: SupabaseClient, organisationId: string, costCentreId: unknown, membersBy: unknown): Promise<CostShareRow> {
	refuseWhen(membersByRefusal(membersBy));
	const share = await findCostShare(supabase, organisationId, costCentreId);
	const { data, error } = await supabase
		.from(CostShareTables.shares)
		.update({ members_by: membersBy as CostShareMembersByChoice, updated_at: new Date().toISOString() })
		.eq('organisation_id', organisationId)
		.eq('id', share.id)
		.select(costShareColumns)
		.single();
	if (error !== null) throw error;
	return data as CostShareRow;
}
