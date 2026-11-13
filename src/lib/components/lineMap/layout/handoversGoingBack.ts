import type { LineMapModel, MapHandover } from './lineMapModel';

export type SplitHandovers = { forward: MapHandover[]; goingBack: MapHandover[] };

type Successors = Map<string, string[]>;

function successorsAlongLines(model: LineMapModel): Successors {
	const successors: Successors = new Map();
	model.lines.forEach((line) => {
		line.stops.slice(1).forEach((stationId, index) => addSuccessor(successors, line.stops[index], stationId));
	});
	return successors;
}

function addSuccessor(successors: Successors, from: string, to: string): void {
	successors.set(from, [...(successors.get(from) ?? []), to]);
}

function canReach(successors: Successors, start: string, goal: string): boolean {
	const waiting = [start];
	const seen = new Set<string>();
	while (waiting.length > 0) {
		const stationId = waiting.pop() as string;
		if (stationId === goal) return true;
		if (seen.has(stationId)) continue;
		seen.add(stationId);
		waiting.push(...(successors.get(stationId) ?? []));
	}
	return false;
}

export function splitHandovers(model: LineMapModel): SplitHandovers {
	const successors = successorsAlongLines(model);
	const split: SplitHandovers = { forward: [], goingBack: [] };
	model.handovers.forEach((handover) => {
		if (canReach(successors, handover.to, handover.from)) {
			split.goingBack.push(handover);
			return;
		}
		split.forward.push(handover);
		addSuccessor(successors, handover.from, handover.to);
	});
	return split;
}
