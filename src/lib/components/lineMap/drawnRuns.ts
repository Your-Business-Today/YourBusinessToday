import type { LineMapLayout, LineRun } from './layout/lineMapLayout';
import { LineTracks, type LineMapModel, type LineTrack, type MapLine } from './layout/lineMapModel';

/** A stretch of a line as one map draws it, how its track is drawn, and whether it carries on into the next row. */
export type DrawnRun = LineRun & { isLeaving: boolean; track: LineTrack };

function rowsReachedBy(line: MapLine, model: LineMapModel, layout: LineMapLayout): number[] {
	const { rowOfStation } = layout;
	const handedOn = model.handovers.filter((handover) => line.stops.includes(handover.from) && !layout.goingBack.includes(handover.from));
	return [...line.stops, ...handedOn.map((handover) => handover.to)].map((stationId) => rowOfStation[stationId]);
}

function drawnRun(line: MapLine, run: LineRun, reached: number[], layout: LineMapLayout): DrawnRun[] {
	const ownStops = line.stops.filter((stationId) => layout.rowOfStation[stationId] === run.row);
	const isArriving = Math.min(...reached) < run.row;
	const isLeaving = Math.max(...reached) > run.row;
	const isReached = ownStops.length > 0 || isArriving;
	if (!isReached) return [];
	const xOf = (stationId: string | undefined, edge: number) => (stationId === undefined ? edge : layout.places[stationId].x);
	const from = isArriving ? run.from : xOf(ownStops[0], run.from);
	const to = isLeaving ? run.to : xOf(ownStops.at(-1), from);
	const track = line.track ?? LineTracks.solid;
	return [{ ...run, name: line.name, colour: line.colour, from, to, isLeaving, track }];
}

/** Each line's stretches on a layout made for this map or with others: one per row it reaches, from its own first stop to its last. */
export function drawnRuns(model: LineMapModel, layout: LineMapLayout): DrawnRun[] {
	return model.lines.flatMap((line) => {
		const reached = rowsReachedBy(line, model, layout);
		const isWithinReach = (run: LineRun) => run.row >= Math.min(...reached) && run.row <= Math.max(...reached);
		const runs = layout.lineRuns.filter((run) => run.lineId === line.id && isWithinReach(run));
		return runs.flatMap((run) => drawnRun(line, run, reached, layout));
	});
}
