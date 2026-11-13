import type { MapStation, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** A station as it sits on a map: the task, with the key and name of the role whose line it is on. */
export type PlacedStation = MapStation & { lineKey: string; lineName: string };

/** The station a key names on a map, with its role, or null when the map has no such station. */
export function placedStation(version: WorkflowMapVersion, stationKey: string): PlacedStation | null {
	for (const line of version.lines) {
		const station = line.stations.find((candidate) => candidate.key === stationKey);
		if (station !== undefined) return { ...station, lineKey: line.key, lineName: line.name };
	}
	return null;
}
