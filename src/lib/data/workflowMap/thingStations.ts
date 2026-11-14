import { emptyVocabulary, type MapVocabulary } from './phraseInDomain';
import { stationTouchesOf, type ThingStationRole } from './stationThings';
import type { WorkflowMapVersion } from './workflowMap';

export const thingStationRoleWords: Record<ThingStationRole, string> = { takesIn: 'Takes it in', produces: 'Produces it' };

/** A station of today's workflow map that takes a Domain thing in or produces it, in the status its phrase names, with its line. */
export type ThingStation = {
	thingSlug: string;
	stationKey: string;
	stationName: string;
	lineName: string;
	role: ThingStationRole;
	status: string | null;
};

/** Every station of the map that touches a Domain thing, once for each thing it takes in and each it produces, found through the glossary. */
export function thingStationsOf(map: WorkflowMapVersion | null, vocabulary: MapVocabulary = emptyVocabulary): ThingStation[] {
	if (map === null) return [];
	return map.lines.flatMap((line) =>
		line.stations.flatMap((station) => {
			const place = { stationKey: station.key, stationName: station.name, lineName: line.name };
			return stationTouchesOf(map, station, vocabulary).map((touch) => ({ ...place, ...touch }));
		})
	);
}

/** A row's key: a station touches a thing once each way for each status. */
export function thingStationKey({ stationKey, role, status }: ThingStation): string {
	return `${stationKey}:${role}:${status ?? ''}`;
}
