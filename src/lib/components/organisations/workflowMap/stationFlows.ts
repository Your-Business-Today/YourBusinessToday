import { listedInWords } from '$lib/data/listedInWords';
import { arrivesFromSentence } from '$lib/data/workflowMap/workflowMapWords';
import { placedStation, type PlacedStation } from './placedStation';
import type { MapArrival, MapHandover, MapStation, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** Something a station takes in, who gives it or where outside it arrives from, and how that goes wrong today when it does. */
export type StationInput = { item: string; source: string | null; goesWrong: string | null };

/** Something a station produces and who it goes to. */
export type StationOutput = { item: string; destination: string | null };

type Arriving = { handovers: MapHandover[]; fromOutside: MapArrival[] };

/** What a station takes in: its own inputs, and anything handed over to it or arriving from outside that it does not list. */
export function inputsOf(version: WorkflowMapVersion, placed: PlacedStation): StationInput[] {
	const arriving = {
		handovers: version.handovers.filter((handover) => handover.toKey === placed.key),
		fromOutside: version.arrivals.filter((arrival) => arrival.stationKey === placed.key)
	};
	const handedIn = arriving.handovers.map((handover) => handover.handedOver);
	const arrivingItems = [...handedIn, ...arriving.fromOutside.map((arrival) => arrival.whatArrives)];
	const listed = new Set(placed.takesIn);
	const unlisted = arrivingItems.filter((item, index) => !listed.has(item) && arrivingItems.indexOf(item) === index);
	return [...placed.takesIn, ...unlisted].map((item) => inputOf(version, placed, item, arriving));
}

/** What a station produces, each with every other station on the map that takes it in. */
export function outputsOf(version: WorkflowMapVersion, placed: PlacedStation): StationOutput[] {
	return placed.produces.map((item) => {
		const takers = otherStationsOf(version, placed).filter((station) => station.takesIn.includes(item));
		return { item, destination: namesAfter('To', takers) };
	});
}

function inputOf(version: WorkflowMapVersion, placed: PlacedStation, item: string, arriving: Arriving): StationInput {
	const handover = arriving.handovers.find((candidate) => candidate.handedOver === item);
	if (handover !== undefined) return { item, source: handedOverBy(version, handover.fromKey), goesWrong: handover.goesWrong };
	const arrival = arriving.fromOutside.find((candidate) => candidate.whatArrives === item);
	if (arrival !== undefined) return { item, source: arrivesFromSentence(arrival.arrivesFrom), goesWrong: null };
	const makers = otherStationsOf(version, placed).filter((station) => station.produces.includes(item));
	return { item, source: namesAfter('From', makers), goesWrong: null };
}

function handedOverBy(version: WorkflowMapVersion, giverKey: string): string | null {
	const giver = placedStation(version, giverKey);
	if (giver === null) return null;
	return `Handed over by ${giver.lineName}, from ${giver.name}`;
}

function otherStationsOf(version: WorkflowMapVersion, placed: PlacedStation): MapStation[] {
	const stations = version.lines.flatMap((line) => line.stations);
	return stations.filter((station) => station.key !== placed.key);
}

function namesAfter(lead: string, stations: MapStation[]): string | null {
	if (stations.length === 0) return null;
	return `${lead} ${listedInWords(stations.map((station) => station.name))}`;
}
