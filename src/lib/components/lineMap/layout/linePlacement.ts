import { forkCorners, joiningCorner } from './forkCorners';
import type { LineMapGeometry } from './lineMapGeometry';
import type { HandoverBranch, LinePlacement, LineRun, StationPlace } from './lineMapLayout';
import type { LineMapModel, MapHandover } from './lineMapModel';
import type { Columns } from './stationColumns';
import { colourOfStation, homeLineOf, linesOfStation } from './stationLines';

type Grid = { geometry: LineMapGeometry; laneOrder: string[]; columns: Columns };

function xOf(grid: Grid, stationId: string): number {
	const { geometry, columns } = grid;
	return geometry.left + columns[stationId] * geometry.pitch;
}

function yOfLine(grid: Grid, lineId: string): number {
	const { geometry, laneOrder } = grid;
	return geometry.top + laneOrder.indexOf(lineId) * geometry.pitch;
}

function stationPlaces(model: LineMapModel, grid: Grid): Record<string, StationPlace> {
	return Object.fromEntries(
		Object.keys(grid.columns).map((stationId) => {
			const ys = linesOfStation(model, stationId).map((lineId) => yOfLine(grid, lineId));
			const place = { x: xOf(grid, stationId), y: yOfLine(grid, homeLineOf(model, stationId)), top: Math.min(...ys), foot: Math.max(...ys) };
			return [stationId, place];
		})
	);
}

function handoverBranches(model: LineMapModel, handovers: MapHandover[], grid: Grid, places: Record<string, StationPlace>): HandoverBranch[] {
	return handovers.map((handover) => {
		const start = { x: places[handover.from].x, y: places[handover.from].y };
		const end = { x: places[handover.to].x, y: places[handover.to].y };
		return { from: handover.from, to: handover.to, colour: colourOfStation(model, handover.from), corners: forkCorners(start, end, grid.geometry) };
	});
}

function lineRuns(model: LineMapModel, grid: Grid, branches: HandoverBranch[]): LineRun[] {
	return model.lines.map((line) => {
		const firstStop = line.stops[0];
		const from = xOf(grid, firstStop);
		const arrivals = branches.filter((branch) => branch.to === firstStop).map((branch) => joiningCorner(branch.corners).x);
		const to = xOf(grid, line.stops.at(-1) ?? firstStop);
		return { lineId: line.id, name: line.name, colour: line.colour, y: yOfLine(grid, line.id), from, to, nameEdge: Math.min(from, ...arrivals), row: 0 };
	});
}

export function placeLines(model: LineMapModel, handovers: MapHandover[], grid: Grid): LinePlacement {
	const { geometry, laneOrder, columns } = grid;
	const places = stationPlaces(model, grid);
	const branches = handoverBranches(model, handovers, grid, places);
	const lastColumn = Math.max(0, ...Object.values(columns));
	const lastLane = Math.max(0, laneOrder.length - 1);
	return {
		...grid,
		places,
		branches,
		lineRuns: lineRuns(model, grid, branches),
		width: geometry.left + lastColumn * geometry.pitch + geometry.right,
		height: geometry.top + lastLane * geometry.pitch + geometry.bottom
	};
}
