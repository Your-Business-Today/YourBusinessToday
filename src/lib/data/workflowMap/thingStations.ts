import type { WorkflowMapVersion } from './workflowMap';

/** Whether a station takes a thing in or produces it. */
export const thingStationRoles = { takesIn: 'takesIn', produces: 'produces' } as const;

export type ThingStationRole = (typeof thingStationRoles)[keyof typeof thingStationRoles];

export const thingStationRoleWords: Record<ThingStationRole, string> = { takesIn: 'Takes it in', produces: 'Produces it' };

/** A station of today's workflow map that takes a Domain thing in or produces it, with the line it sits on. */
export type ThingStation = { thingSlug: string; stationKey: string; stationName: string; lineName: string; role: ThingStationRole };

/** Every station of the map that names a Domain thing, once for each thing it takes in and each it produces. */
export function thingStationsOf(map: WorkflowMapVersion | null): ThingStation[] {
	if (map === null) return [];
	return map.lines.flatMap((line) =>
		line.stations.flatMap((station) => {
			const place = { stationKey: station.key, stationName: station.name, lineName: line.name };
			const takenIn = station.takesInThings.map((thingSlug) => ({ ...place, thingSlug, role: thingStationRoles.takesIn }));
			const produced = station.producesThings.map((thingSlug) => ({ ...place, thingSlug, role: thingStationRoles.produces }));
			return [...takenIn, ...produced];
		})
	);
}
