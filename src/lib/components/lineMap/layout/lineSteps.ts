import type { LineMapModel } from './lineMapModel';

export type LineStep = { from: string; to: string };

export type Successors = Map<string, string[]>;

export function addSuccessor(successors: Successors, from: string, to: string): void {
	successors.set(from, [...(successors.get(from) ?? []), to]);
}

export function canReach(successors: Successors, start: string, goal: string): boolean {
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

function everyLineStep(model: LineMapModel): LineStep[] {
	return model.lines.flatMap((line) => line.stops.slice(1).map((stationId, index) => ({ from: line.stops[index], to: stationId })));
}

/**
 * The steps from stop to stop that set the stations' order left to right. A step back to a station that already
 * leads to its own start, as when one line runs A to B and another B to A, is left out, so the order has no loop.
 */
export function forwardLineSteps(model: LineMapModel): LineStep[] {
	const successors: Successors = new Map();
	const forward: LineStep[] = [];
	for (const step of everyLineStep(model)) {
		if (canReach(successors, step.to, step.from)) continue;
		addSuccessor(successors, step.from, step.to);
		forward.push(step);
	}
	return forward;
}
