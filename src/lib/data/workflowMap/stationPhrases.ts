import type { MapStation, WorkflowMapDraft } from './workflowMap';

/** The phrases a station takes in and produces, its hand-overs and arrivals counted: what arrives at it is taken in, what leaves it is produced. */
export type StationPhrases = { takesIn: string[]; produces: string[] };

/** What a map passes between its stations and brings in from outside. */
type MapPassings = Pick<WorkflowMapDraft, 'handovers' | 'arrivals'>;

/** A station's phrases as it lists them and as the map's hand-overs pass them to and from it. */
export function stationPhrasesOf(map: MapPassings, station: MapStation): StationPhrases {
	const arriving = phrasesArrivingAt(map, station.key);
	const leaving = phrasesLeaving(map, station.key);
	return { takesIn: [...station.takesIn, ...arriving], produces: [...station.produces, ...leaving] };
}

/** What is handed over to a station and what arrives at it from outside. */
export function phrasesArrivingAt({ handovers, arrivals }: MapPassings, stationKey: string): string[] {
	const handedIn = handovers.filter((handover) => handover.toKey === stationKey).map((handover) => handover.handedOver);
	const fromOutside = arrivals.filter((arrival) => arrival.stationKey === stationKey).map((arrival) => arrival.whatArrives);
	return [...handedIn, ...fromOutside];
}

/** What a station hands over to other lines. */
export function phrasesLeaving({ handovers }: MapPassings, stationKey: string): string[] {
	return handovers.filter((handover) => handover.fromKey === stationKey).map((handover) => handover.handedOver);
}

/** Every phrase of a station, whichever way it goes. */
export function allPhrasesOf({ takesIn, produces }: StationPhrases): string[] {
	return [...takesIn, ...produces];
}
