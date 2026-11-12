import { clientStageOrder } from '$lib/data/clientLifecycle';
import { listClientsKeptBy } from '$lib/server/clients/listClients';
import { getStaffDirectory } from '$lib/server/projects/getStaffDirectory';
import { salesStandingsOf, type SalesStanding } from '$lib/data/salesLeaderboard';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Every staff member's leads and won sales on one organisation's registers, the most won first. */
export async function loadSalesLeaderboard(supabase: SupabaseClient, organisationId: string): Promise<SalesStanding[]> {
	const [records, staffMembers] = await Promise.all([
		listClientsKeptBy(supabase, organisationId, clientStageOrder),
		getStaffDirectory(supabase)
	]);
	return salesStandingsOf(records, staffMembers);
}
