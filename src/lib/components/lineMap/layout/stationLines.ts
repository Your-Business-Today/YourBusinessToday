import type { LineColour, LineMapModel } from './lineMapModel';

const colourOfAStrayStation: LineColour = 'daylight';

export function linesOfStation(model: LineMapModel, stationId: string): string[] {
	return model.lines.filter((line) => line.stops.includes(stationId)).map((line) => line.id);
}

export function homeLineOf(model: LineMapModel, stationId: string): string {
	return linesOfStation(model, stationId)[0];
}

export function stationsOnLines(model: LineMapModel): string[] {
	const stops = new Set(model.lines.flatMap((line) => line.stops));
	return Object.keys(model.stations).filter((stationId) => stops.has(stationId));
}

export function withoutLooseEnds(model: LineMapModel): LineMapModel {
	const isKnown = (stationId: string) => stationId in model.stations;
	const lines = model.lines.map((line) => ({ ...line, stops: line.stops.filter(isKnown) })).filter(({ stops }) => stops.length > 0);
	const tidied = { ...model, lines };
	const stationIds = new Set(stationsOnLines(tidied));
	const handovers = model.handovers.filter((handover) => stationIds.has(handover.from) && stationIds.has(handover.to));
	return { ...tidied, handovers };
}

export function colourOfStation(model: LineMapModel, stationId: string): LineColour {
	const homeLine = model.lines.find((line) => line.id === homeLineOf(model, stationId));
	return homeLine?.colour ?? colourOfAStrayStation;
}
