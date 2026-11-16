import { arrivalWords, handoverWords, isSameArrival, isSameHandover, type AmendingMap, type AmendingStep } from './amendingMap';
import type { MapArrival, MapHandover } from './workflowMap';

/** Puts each hand-over: one joining the same two stations as one the map holds replaces it, any other goes at the end. */
export function putHandovers(map: AmendingMap, handovers: MapHandover[]): AmendingStep {
	for (const handover of handovers) {
		const position = map.handovers.findIndex((held) => isSameHandover(held, handover));
		const words = handoverWords(handover);
		if (position < 0) {
			map.handovers.push(handover);
			map.added.push(words);
			continue;
		}
		map.handovers[position] = handover;
		map.replaced.push(words);
	}
	return null;
}

/** Puts each arrival: the same thing arriving at the same station replaces the one held, any other goes at the end. */
export function putArrivals(map: AmendingMap, arrivals: MapArrival[]): AmendingStep {
	for (const arrival of arrivals) {
		const position = map.arrivals.findIndex((held) => isSameArrival(held, arrival));
		const words = arrivalWords(arrival);
		if (position < 0) {
			map.arrivals.push(arrival);
			map.added.push(words);
			continue;
		}
		map.arrivals[position] = arrival;
		map.replaced.push(words);
	}
	return null;
}
