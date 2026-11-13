import type { MapStation, WorkflowMapVersion } from './workflowMap';

/** The phrases a station takes in and produces, its hand-overs counted: what arrives at it is taken in, what leaves it is produced. */
export type StationPhrases = { takesIn: string[]; produces: string[] };

/** A station's phrases as it lists them and as the map's hand-overs pass them to and from it. */
export function stationPhrasesOf({ handovers }: WorkflowMapVersion, station: MapStation): StationPhrases {
	const arriving = handovers.filter((handover) => handover.toKey === station.key).map((handover) => handover.handedOver);
	const leaving = handovers.filter((handover) => handover.fromKey === station.key).map((handover) => handover.handedOver);
	return { takesIn: [...station.takesIn, ...arriving], produces: [...station.produces, ...leaving] };
}

/** Every phrase of a station, whichever way it goes. */
export function allPhrasesOf({ takesIn, produces }: StationPhrases): string[] {
	return [...takesIn, ...produces];
}
