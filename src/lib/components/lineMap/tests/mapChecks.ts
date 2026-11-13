import { forkPointsOffLanes, isInside } from '../layout/labelGeometry';
import type { Box } from '../layout/lineMapGeometry';
import type { HandoverBranch, LineMapLayout, StationPlace } from '../layout/lineMapLayout';

const stationRadius = 10;

function isNearStation(place: StationPlace, branch: HandoverBranch): boolean {
	const capsule: Box = { x: place.x, y: place.top, width: 0, height: place.foot - place.top };
	return forkPointsOffLanes([branch]).some((point) => isInside(point, capsule, stationRadius));
}

export function forksThroughStations(layout: LineMapLayout): string[] {
	return layout.branches.flatMap((branch) =>
		Object.entries(layout.places)
			.filter(([, place]) => isNearStation(place, branch))
			.map(([stationId]) => `${branch.from} to ${branch.to} runs through ${stationId}`)
	);
}

function isUnderARun(layout: LineMapLayout, label: Box): boolean {
	return layout.lineRuns.some((run) => run.y > label.y && run.y < label.y + label.height && run.from < label.x + label.width && run.to > label.x);
}

function isUnderAFork(layout: LineMapLayout, label: Box): boolean {
	return forkPointsOffLanes(layout.branches).some((point) => isInside(point, label, 0));
}

export function namesUnderLines(layout: LineMapLayout): string[] {
	return Object.entries(layout.labels)
		.filter(([, label]) => isUnderARun(layout, label) || isUnderAFork(layout, label))
		.map(([stationId]) => stationId);
}
