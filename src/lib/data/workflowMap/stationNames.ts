import type { WorkflowMapVersion } from './workflowMap';

/** Each station's name by its key on the map shown; none when there is no map. */
export function stationNamesOf(map: WorkflowMapVersion | null): Record<string, string> {
	if (map === null) return {};
	const stations = map.lines.flatMap((line) => line.stations);
	return Object.fromEntries(stations.map((station) => [station.key, station.name]));
}
