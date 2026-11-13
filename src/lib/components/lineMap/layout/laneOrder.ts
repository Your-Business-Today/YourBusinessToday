import type { LineMapModel, MapHandover } from './lineMapModel';
import { laneOrderCost, type LaneOrderCost } from './laneOrderCost';
import { rearrangementsOf } from './laneRearrangements';

const mostLinesTriedEveryWay = 7;

function permutationsOf(items: string[]): string[][] {
	if (items.length <= 1) return [items];
	return items.flatMap((item, index) =>
		permutationsOf([...items.slice(0, index), ...items.slice(index + 1)]).map((rest) => [item, ...rest])
	);
}

function cheapest(orders: string[][], costOf: LaneOrderCost): string[] {
	const costs = orders.map(costOf);
	const lowest = costs.reduce((best, cost, index) => (cost < costs[best] ? index : best), 0);
	return orders[lowest];
}

function improvedByRearranging(order: string[], costOf: LaneOrderCost): string[] {
	let best = order;
	for (let round = 0; round < order.length * order.length; round += 1) {
		const better = cheapest([best, ...rearrangementsOf(best)], costOf);
		if (better === best) return best;
		best = better;
	}
	return best;
}

export function orderLanes(model: LineMapModel, handovers: MapHandover[]): string[] {
	const lineIds = model.lines.map((line) => line.id);
	const costOf = laneOrderCost(model, handovers);
	const isFewEnoughToTryEveryWay = lineIds.length <= mostLinesTriedEveryWay;
	return isFewEnoughToTryEveryWay ? cheapest(permutationsOf(lineIds), costOf) : improvedByRearranging(lineIds, costOf);
}
