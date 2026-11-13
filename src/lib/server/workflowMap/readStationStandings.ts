import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';
import type { StationReviewState, StationStanding, StationStandings } from '$lib/data/workflowMap/stationReview';
import type { SupabaseClient } from '@supabase/supabase-js';

type StandingRow = Record<string, unknown>;

/**
 * Each station's standing on a filed version: its latest mark, or the latest made on it in an earlier version of the
 * same stage while it read exactly as it does now (workflow_map_station_standings, migration 0212). None before 0212.
 */
export async function readStationStandings(
	supabase: SupabaseClient,
	organisationId: string,
	map: WorkflowMapVersion | null
): Promise<StationStandings> {
	if (map === null) return {};
	const { data, error } = await supabase.rpc('workflow_map_station_standings', {
		target_organisation: organisationId,
		shown_stage: map.stage,
		shown_version: map.versionNumber
	});
	if (isSchemaNotYetMigrated(error)) return {};
	if (error) throw error;
	const rows = (data ?? []) as StandingRow[];
	return Object.fromEntries(rows.map((row) => [String(row.station_key), standingOf(row, map.versionNumber)]));
}

function standingOf(row: StandingRow, shownVersion: number): StationStanding {
	const markedOnVersion = Number(row.marked_on_version);
	return {
		reviewState: String(row.review_state) as StationReviewState,
		whatIsWrong: row.what_is_wrong === null ? null : String(row.what_is_wrong),
		markedOnVersion: markedOnVersion === shownVersion ? null : markedOnVersion
	};
}
