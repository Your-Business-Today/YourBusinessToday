import type { LineMapModel, MapHandover } from './lineMapModel';
import { addSuccessor, canReach, forwardLineSteps, type Successors } from './lineSteps';

export type SplitHandovers = { forward: MapHandover[]; goingBack: MapHandover[] };

function successorsAlongLines(model: LineMapModel): Successors {
	const successors: Successors = new Map();
	forwardLineSteps(model).forEach((step) => addSuccessor(successors, step.from, step.to));
	return successors;
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
