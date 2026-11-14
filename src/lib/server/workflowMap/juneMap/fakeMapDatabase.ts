import type { SupabaseClient } from '@supabase/supabase-js';
import { lineKind, type MapLine, type WorkflowMapDraft } from '$lib/data/workflowMap/workflowMap';

type Row = Record<string, unknown>;
type TableName = 'workflow_map_versions' | 'workflow_map_lines' | 'workflow_map_stations' | 'workflow_map_handovers' | 'workflow_map_arrivals';
type Tables = Record<TableName, Row[]>;
type FilingArguments = { target_organisation: string; recorder: string; map: WorkflowMapDraft };
type Answer = { data: unknown; error: null };

const filedAt = '2026-11-13T05:00:00Z';

/** A stand-in for the database in tests: file_workflow_map writes rows as migrations 0210 and 0215 do, and they read back. */
export function fakeMapDatabase(): SupabaseClient {
	const tables: Tables = {
		workflow_map_versions: [],
		workflow_map_lines: [],
		workflow_map_stations: [],
		workflow_map_handovers: [],
		workflow_map_arrivals: []
	};
	const supabase = {
		rpc: async (_name: string, filing: FilingArguments): Promise<Answer> => ({ data: fileInto(tables, filing), error: null }),
		from: (table: TableName) => queryOver(tables[table])
	};
	return supabase as unknown as SupabaseClient;
}

function fileInto(tables: Tables, { target_organisation, map }: FilingArguments): number {
	const versions = tables.workflow_map_versions;
	const earlier = versions.filter((row) => row.organisation_id === target_organisation && row.stage === map.stage);
	const versionNumber = earlier.length + 1;
	const versionId = crypto.randomUUID();
	versions.push({ id: versionId, organisation_id: target_organisation, stage: map.stage, version_number: versionNumber, recorded_at: filedAt });
	const stationIds = new Map<string, string>();
	map.lines.forEach((line, index) => fileLine(tables, { versionId, line, position: index + 1, stationIds }));
	map.handovers.forEach((handover, index) =>
		tables.workflow_map_handovers.push({
			version_id: versionId,
			from_station_id: stationIds.get(handover.fromKey),
			to_station_id: stationIds.get(handover.toKey),
			position: index + 1,
			handed_over: handover.handedOver,
			goes_wrong: handover.goesWrong
		})
	);
	(map.arrivals ?? []).forEach((arrival, index) =>
		tables.workflow_map_arrivals.push({
			version_id: versionId,
			station_id: stationIds.get(arrival.stationKey),
			position: index + 1,
			what_arrives: arrival.whatArrives,
			arrives_from: arrival.arrivesFrom
		})
	);
	return versionNumber;
}

type LineFiling = { versionId: string; line: MapLine; position: number; stationIds: Map<string, string> };

function fileLine(tables: Tables, { versionId, line, position, stationIds }: LineFiling): void {
	const lineId = crypto.randomUUID();
	const kind = line.kind ?? lineKind.role;
	tables.workflow_map_lines.push({ id: lineId, version_id: versionId, line_key: line.key, position, name: line.name, kind });
	line.stations.forEach((station, index) => {
		const stationId = crypto.randomUUID();
		stationIds.set(station.key, stationId);
		tables.workflow_map_stations.push({
			id: stationId, version_id: versionId, line_id: lineId, station_key: station.key, position: index + 1,
			name: station.name, summary: station.summary, takes_in: station.takesIn, produces: station.produces,
			done_in: station.doneIn, is_output: station.isOutput, state: station.state, product_id: station.productId,
			takes_in_things: station.takesInThings, produces_things: station.producesThings
		});
	});
}

function queryOver(rows: Row[]) {
	let selected = [...rows];
	const query = {
		select: () => query,
		eq: (column: string, value: unknown) => {
			selected = selected.filter((row) => row[column] === value);
			return query;
		},
		order: (column: string, options: { ascending?: boolean } = {}) => {
			const direction = options.ascending === false ? -1 : 1;
			selected = [...selected].sort((first, second) => direction * (Number(first[column]) - Number(second[column])));
			return query;
		},
		limit: (count: number) => {
			selected = selected.slice(0, count);
			return query;
		},
		maybeSingle: async (): Promise<Answer> => ({ data: selected[0] ?? null, error: null }),
		then: (resolve: (answer: Answer) => unknown) => resolve({ data: selected, error: null })
	};
	return query;
}
