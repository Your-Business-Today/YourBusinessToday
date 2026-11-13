import { StationKinds, type LineColour, type LineMapModel, type MapHandover } from '$lib/components/lineMap/layout/lineMapModel';
import type { MapStation, WorkflowMapVersion } from '$lib/data/workflowMap/workflowMap';
import { lineColourAt, lineColourOrder } from '$lib/components/lineMap/lineColourOrder';

/** The colour of a role no colour was given for, which every role filed is. */
export const firstLineColour: LineColour = lineColourOrder[0];

/** Each role's colour, the same on every map it is drawn on, so a line keeps its colour from Before to After. */
export function lineColoursOf(versions: WorkflowMapVersion[]): Map<string, LineColour> {
	const lineKeys = [...new Set(versions.flatMap((version) => version.lines.map((line) => line.key)))];
	return new Map(lineKeys.map((lineKey, index) => [lineKey, lineColourAt(index)]));
}

/** A filed map as the line map draws it: its roles as lines, its tasks as stations and its hand-overs. */
export function lineMapOf(version: WorkflowMapVersion, colours: Map<string, LineColour>): LineMapModel {
	const stations = version.lines.flatMap((line) => line.stations);
	return {
		lines: version.lines.map((line) => ({
			id: line.key,
			name: line.name,
			colour: colours.get(line.key) ?? firstLineColour,
			stops: line.stations.map((station) => station.key)
		})),
		stations: Object.fromEntries(stations.map((station) => [station.key, drawnStationOf(station)])),
		handovers: version.handovers.map(({ fromKey, toKey, goesWrong }): MapHandover => {
			const handover = { from: fromKey, to: toKey };
			return goesWrong === null ? handover : { ...handover, failure: goesWrong };
		})
	};
}

function drawnStationOf(station: MapStation) {
	const kind = station.isOutput ? StationKinds.output : StationKinds.task;
	return { name: station.name, kind, state: station.state };
}
