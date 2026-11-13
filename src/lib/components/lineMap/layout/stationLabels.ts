import { boxesOverlap, forkPointsOffLanes, isCrossedByForks, isInside } from './labelGeometry';
import { labelChoices, preferredOrder } from './labelChoices';
import { LabelSpacing, type Box, type LineMapGeometry, type Point } from './lineMapGeometry';
import type { LineName, LinePlacement, LineRun, StationLabel } from './lineMapLayout';
import type { LineMapModel } from './lineMapModel';
import type { MeasureText } from './textMeasure';

const ClashWeights = { forkPoint: 5, otherLabel: 40, line: 60 } as const;

type Obstacles = { forkPoints: Point[]; placed: Box[]; lineRuns: LineRun[] };

function isRunThrough(run: LineRun, box: Box): boolean {
	const isLevel = run.y > box.y - LabelSpacing.lineClearance && run.y < box.y + box.height + LabelSpacing.lineClearance;
	return isLevel && run.from < box.x + box.width && run.to > box.x;
}

function clashesOf(box: Box, obstacles: Obstacles): number {
	const forkClashes = obstacles.forkPoints.filter((point) => isInside(point, box, LabelSpacing.forkClearance)).length;
	const labelClashes = obstacles.placed.filter((other) => boxesOverlap(box, other, LabelSpacing.boxClearance)).length;
	const lineClashes = obstacles.lineRuns.filter((run) => isRunThrough(run, box)).length;
	return forkClashes * ClashWeights.forkPoint + labelClashes * ClashWeights.otherLabel + lineClashes * ClashWeights.line;
}

function stationsLeftToRight(placement: LinePlacement): string[] {
	const { places } = placement;
	return Object.keys(places).sort((first, second) => places[first].x - places[second].x || places[first].y - places[second].y);
}

export function squeezedStation(model: LineMapModel, placement: LinePlacement, measure: MeasureText): string | undefined {
	const forkPoints = forkPointsOffLanes(placement.branches);
	return stationsLeftToRight(placement).find((stationId) => {
		const choices = labelChoices(model.stations[stationId], placement.places[stationId], placement.geometry, measure);
		return isCrossedByForks(choices.above, forkPoints) && isCrossedByForks(choices.below, forkPoints);
	});
}

export function placeLabels(model: LineMapModel, placement: LinePlacement, lineNames: LineName[], measure: MeasureText): Record<string, StationLabel> {
	const obstacles: Obstacles = { forkPoints: forkPointsOffLanes(placement.branches), placed: [...lineNames], lineRuns: placement.lineRuns };
	const labels: Record<string, StationLabel> = {};
	stationsLeftToRight(placement).forEach((stationId) => {
		const station = model.stations[stationId];
		const choices = labelChoices(station, placement.places[stationId], placement.geometry, measure);
		const [first, second] = preferredOrder(station, choices);
		const choice = clashesOf(first, obstacles) <= clashesOf(second, obstacles) ? first : second;
		obstacles.placed.push(choice);
		labels[stationId] = choice;
	});
	return labels;
}
