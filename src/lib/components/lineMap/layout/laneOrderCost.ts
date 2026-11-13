import type { LineMapModel, MapHandover } from './lineMapModel';
import { homeLineOf, linesOfStation, stationsOnLines } from './stationLines';

const CostWeights = { crossing: 1000, sharedStation: 2 } as const;

export type LaneOrderCost = (order: string[]) => number;

function spreadOf(lanes: number[]): number {
	return Math.max(...lanes) - Math.min(...lanes) - (lanes.length - 1);
}

export function laneOrderCost(model: LineMapModel, handovers: MapHandover[]): LaneOrderCost {
	const givenOrder = model.lines.map((line) => line.id);
	const handoverLines = handovers.map((handover) => [homeLineOf(model, handover.from), homeLineOf(model, handover.to)]);
	const sharedLines = stationsOnLines(model)
		.map((stationId) => linesOfStation(model, stationId))
		.filter((lineIds) => lineIds.length > 1);
	return (order) => {
		const lanes = new Map(order.map((lineId, lane) => [lineId, lane]));
		const laneOf = (lineId: string) => lanes.get(lineId) ?? 0;
		const handoverCost = handoverLines.reduce((sum, [giving, receiving]) => sum + Math.abs(laneOf(giving) - laneOf(receiving)), 0);
		const sharedCost = sharedLines.reduce((sum, lineIds) => sum + spreadOf(lineIds.map(laneOf)), 0);
		const driftCost = order.reduce((sum, lineId, lane) => sum + Math.abs(lane - givenOrder.indexOf(lineId)), 0);
		return (handoverCost + sharedCost * CostWeights.sharedStation) * CostWeights.crossing + driftCost;
	};
}
