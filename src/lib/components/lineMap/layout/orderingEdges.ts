import type { LineMapModel, MapHandover } from './lineMapModel';
import { homeLineOf } from './stationLines';

export type OrderingEdge = { from: string; to: string; columns: number; isHandover: boolean };

function edgesAlongLines(model: LineMapModel): OrderingEdge[] {
	return model.lines.flatMap((line) =>
		line.stops.slice(1).map((stationId, index) => ({ from: line.stops[index], to: stationId, columns: 1, isHandover: false }))
	);
}

export function orderingEdges(model: LineMapModel, handovers: MapHandover[], laneOrder: string[]): OrderingEdge[] {
	const laneOfStation = (stationId: string) => laneOrder.indexOf(homeLineOf(model, stationId));
	const acrossLines = handovers.map((handover) => {
		const lanesApart = Math.abs(laneOfStation(handover.from) - laneOfStation(handover.to));
		return { from: handover.from, to: handover.to, columns: lanesApart + 1, isHandover: true };
	});
	return [...edgesAlongLines(model), ...acrossLines];
}
