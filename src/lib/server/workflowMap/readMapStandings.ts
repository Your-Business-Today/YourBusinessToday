import { readStationStandings } from './readStationStandings';
import type { MapStandings } from '$lib/data/workflowMap/stationReview';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

type FiledMaps = { before: WorkflowMapVersion | null; after: WorkflowMapVersion | null };

/** Where each station of the latest Before and After stands. */
export async function readMapStandings(supabase: SupabaseClient, organisationId: string, maps: FiledMaps): Promise<MapStandings> {
	const [before, after] = await Promise.all([
		readStationStandings(supabase, organisationId, maps.before),
		readStationStandings(supabase, organisationId, maps.after)
	]);
	return { before, after };
}
