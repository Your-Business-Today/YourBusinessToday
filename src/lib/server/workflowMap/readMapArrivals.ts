import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapArrival } from '$lib/data/workflowMap/workflowMap';

/** A version's arrivals from outside in the order they were filed, each told by the key of the station it starts. */
export async function readMapArrivals(supabase: SupabaseClient, versionId: string, keysById: Map<string, string>): Promise<MapArrival[]> {
	const { data, error } = await supabase
		.from('workflow_map_arrivals')
		.select('station_id, what_arrives, arrives_from')
		.eq('version_id', versionId)
		.order('position');
	if (error) throw error;
	return data.map((row) => ({
		whatArrives: String(row.what_arrives),
		arrivesFrom: String(row.arrives_from),
		stationKey: keysById.get(String(row.station_id)) ?? ''
	}));
}
