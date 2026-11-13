import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapHandover } from '$lib/data/workflowMap/workflowMap';

/** A version's hand-overs in the order they were filed, each told by the keys of the stations it joins. */
export async function readMapHandovers(
	supabase: SupabaseClient,
	versionId: string,
	keysById: Map<string, string>
): Promise<MapHandover[]> {
	const { data, error } = await supabase
		.from('workflow_map_handovers')
		.select('from_station_id, to_station_id, handed_over, goes_wrong')
		.eq('version_id', versionId)
		.order('position');
	if (error) throw error;
	return data.map((row) => ({
		fromKey: keysById.get(String(row.from_station_id)) ?? '',
		toKey: keysById.get(String(row.to_station_id)) ?? '',
		handedOver: String(row.handed_over),
		goesWrong: row.goes_wrong === null ? null : String(row.goes_wrong)
	}));
}
