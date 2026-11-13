import { readMapArrivals } from './readMapArrivals';
import { readMapHandovers } from './readMapHandovers';
import { readMapStations } from './readMapStations';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LineKind, MapLine, MapStage, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

type VersionRow = Record<string, unknown>;

/** A filed version read whole: its lines in order, each with its stations in order, then its hand-overs and arrivals in order. */
export async function readMapContents(supabase: SupabaseClient, version: VersionRow): Promise<WorkflowMapVersion> {
	const versionId = String(version.id);
	const { data, error } = await supabase
		.from('workflow_map_lines')
		.select('id, line_key, name, kind')
		.eq('version_id', versionId)
		.order('position');
	if (error) throw error;
	const { stationsByLine, keysById } = await readMapStations(supabase, versionId);
	const lines: MapLine[] = data.map((row) => ({
		key: String(row.line_key),
		name: String(row.name),
		kind: String(row.kind) as LineKind,
		stations: stationsByLine.get(String(row.id)) ?? []
	}));
	const handovers = await readMapHandovers(supabase, versionId, keysById);
	const arrivals = await readMapArrivals(supabase, versionId, keysById);
	return {
		stage: String(version.stage) as MapStage,
		versionNumber: Number(version.version_number),
		recordedAt: String(version.recorded_at),
		lines,
		handovers,
		arrivals
	};
}
