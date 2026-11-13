import { listedInWords } from '$lib/data/listedInWords';
import { placedStation, type PlacedStation } from './placedStation';
import type { MapHandover, MapStation, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';

/** Something a station takes in, who gives it, and how that goes wrong today when it does. */
export type StationInput = { item: string; source: string | null; goesWrong: string | null };

/** Something a station produces and who it goes to. */
export type StationOutput = { item: string; destination: string | null };

/** What a station takes in: its own inputs, and anything handed over to it that it does not list. */
export function inputsOf(version: WorkflowMapVersion, placed: PlacedStation): StationInput[] {
	const arriving = version.handovers.filter((handover) => handover.toKey === placed.key);
	const takesIn = placed.takesIn;
	const unlisted = arriving.map((handover) => handover.handedOver).filter((item) => !takesIn.includes(item));
	return [...takesIn, ...unlisted].map((item) => inputOf(version, placed, item, arriving));
}

/** What a station produces, each with every other station on the map that takes it in. */
export function outputsOf(version: WorkflowMapVersion, placed: PlacedStation): StationOutput[] {
	return placed.produces.map((item) => {
		const takers = otherStationsOf(version, placed).filter((station) => station.takesIn.includes(item));
		return { item, destination: namesAfter('To', takers) };
	});
}

function inputOf(version: WorkflowMapVersion, placed: PlacedStation, item: string, arriving: MapHandover[]): StationInput {
	const handover = arriving.find((candidate) => candidate.handedOver === item);
	if (handover !== undefined) return { item, source: handedOverBy(version, handover.fromKey), goesWrong: handover.goesWrong };
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
