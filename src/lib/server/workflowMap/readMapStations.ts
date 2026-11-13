import type { SupabaseClient } from '@supabase/supabase-js';
import type { MapStation, StationState } from '$lib/data/workflowMap/workflowMap';

/** A version's stations grouped by the line they sit on, in order, and each station's key by its id. */
export type StoredStations = { stationsByLine: Map<string, MapStation[]>; keysById: Map<string, string> };

type StationRow = Record<string, unknown>;

const stationColumns =
	'id, line_id, station_key, name, summary, takes_in, produces, done_in, is_output, state, product_id, takes_in_things, produces_things';

export async function readMapStations(supabase: SupabaseClient, versionId: string): Promise<StoredStations> {
	const { data, error } = await supabase
		.from('workflow_map_stations')
		.select(stationColumns)
		.eq('version_id', versionId)
		.order('position');
	if (error) throw error;
	const stationsByLine = new Map<string, MapStation[]>();
	for (const row of data as StationRow[]) {
		const lineId = String(row.line_id);
		const lineStations = stationsByLine.get(lineId) ?? [];
		stationsByLine.set(lineId, [...lineStations, stationOf(row)]);
	}
	const keysById = new Map(data.map((row: StationRow) => [String(row.id), String(row.station_key)]));
	return { stationsByLine, keysById };
}

function stationOf(row: StationRow): MapStation {
	return {
		key: String(row.station_key),
		name: String(row.name),
		summary: String(row.summary),
		takesIn: wordsOf(row.takes_in),
		produces: wordsOf(row.produces),
		doneIn: textOrNull(row.done_in),
		isOutput: row.is_output === true,
		state: String(row.state) as StationState,
		productId: textOrNull(row.product_id),
		takesInThings: wordsOf(row.takes_in_things),
		producesThings: wordsOf(row.produces_things)
	};
}

function wordsOf(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.map(String);
}

function textOrNull(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	return String(value);
}
