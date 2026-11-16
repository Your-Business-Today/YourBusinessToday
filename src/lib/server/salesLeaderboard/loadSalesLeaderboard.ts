import { clientStageOrder } from '$lib/data/clientLifecycle';
import { listClientsKeptBy } from '$lib/server/clients/listClients';
import { loadOrganisationSalespeople } from '$lib/server/salesPeople/loadOrganisationSalespeople';
import { salesStandingsOf, type SalesStanding } from '$lib/data/salesLeaderboard';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Each of the organisation's own people's leads and won sales on its registers, the most won first. */
export async function loadSalesLeaderboard(supabase: SupabaseClient, organisationId: string): Promise<SalesStanding[]> {
	const records = await listClientsKeptBy(supabase, organisationId, clientStageOrder);
	const ownerIds = records.map(({ ownerId }) => ownerId);
	const salespeople = await loadOrganisationSalespeople(supabase, organisationId, ownerIds);
	return salesStandingsOf(records, salespeople);
}
