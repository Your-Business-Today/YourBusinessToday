import { isSameHandover } from './layout/combinedMap';
import { joiningCorner } from './layout/forkCorners';
import type { Point } from './layout/lineMapGeometry';
import type { HandoverBranch, LineMapLayout, LineName } from './layout/lineMapLayout';
import type { LineMapModel, MapHandover } from './layout/lineMapModel';
import { withoutLooseEnds } from './layout/stationLines';
import { drawnRuns, type DrawnRun } from './drawnRuns';
import { drawnStations, type DrawnStation, type Lighting } from './drawnStations';

export type DrawnBranch = HandoverBranch & { failure?: string; joinsAt: Point };

export type LineMapDrawing = { runs: DrawnRun[]; branches: DrawnBranch[]; stations: DrawnStation[]; lineNames: LineName[] };

function drawnBranches(handovers: MapHandover[], layout: LineMapLayout): DrawnBranch[] {
	return layout.branches.flatMap((branch) => {
		const handover = handovers.find((candidate) => isSameHandover(candidate, branch));
		if (handover === undefined) return [];
		return [{ ...branch, failure: handover.failure, joinsAt: joiningCorner(branch.corners) }];
	});
}

/** The key a line's stretch in one row is known by, shared by its run and its name. */
export const runKey = (run: { row: number; lineId: string }) => `${run.row}:${run.lineId}`;

export function drawingOf(map: LineMapModel, layout: LineMapLayout, lighting: Lighting = {}): LineMapDrawing {
	const model = withoutLooseEnds(map);
	const branches = drawnBranches(model.handovers, layout);
	const runs = drawnRuns(model, layout);
	const drawnRunKeys = new Set(runs.map(runKey));
	return {
		runs,
		branches,
		stations: drawnStations(model, layout, branches, lighting),
		lineNames: layout.lineNames.filter((lineName) => drawnRunKeys.has(runKey(lineName)))
	};
}
