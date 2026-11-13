import { isSameHandover } from './layout/combinedMap';
import { joiningCorner } from './layout/forkCorners';
import type { Point } from './layout/lineMapGeometry';
import type { HandoverBranch, LineMapLayout, LineName, LineRun } from './layout/lineMapLayout';
import type { LineMapModel, MapHandover } from './layout/lineMapModel';
import { withoutLooseEnds } from './layout/stationLines';
import { drawnStations, type DrawnStation, type Lighting } from './drawnStations';

export type DrawnBranch = HandoverBranch & { failure?: string; joinsAt: Point };

export type LineMapDrawing = { runs: LineRun[]; branches: DrawnBranch[]; stations: DrawnStation[]; lineNames: LineName[] };

function drawnRuns(model: LineMapModel, layout: LineMapLayout): LineRun[] {
	const { places } = layout;
	return model.lines.flatMap((line) => {
		const laidOut = layout.lineRuns.find((run) => run.lineId === line.id);
		if (laidOut === undefined) return [];
		const lastStop = line.stops.at(-1) ?? line.stops[0];
		return [{ ...laidOut, name: line.name, colour: line.colour, from: places[line.stops[0]].x, to: places[lastStop].x }];
	});
}

function drawnBranches(handovers: MapHandover[], layout: LineMapLayout): DrawnBranch[] {
	return layout.branches.flatMap((branch) => {
		const handover = handovers.find((candidate) => isSameHandover(candidate, branch));
		if (handover === undefined) return [];
		return [{ ...branch, failure: handover.failure, joinsAt: joiningCorner(branch.corners) }];
	});
}

export function drawingOf(map: LineMapModel, layout: LineMapLayout, lighting: Lighting = {}): LineMapDrawing {
	const model = withoutLooseEnds(map);
	const lineIds = new Set(model.lines.map((line) => line.id));
	const branches = drawnBranches(model.handovers, layout);
	return {
		runs: drawnRuns(model, layout),
		branches,
		stations: drawnStations(model, layout, branches, lighting),
		lineNames: layout.lineNames.filter((lineName) => lineIds.has(lineName.lineId))
	};
}
