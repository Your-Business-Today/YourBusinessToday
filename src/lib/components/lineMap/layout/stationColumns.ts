import type { OrderingEdge } from './orderingEdges';

export type Columns = Record<string, number>;

function pushedRight(columns: Columns, edges: OrderingEdge[], passes: number): Columns {
	const pushed = { ...columns };
	for (let pass = 0; pass < passes; pass += 1) {
		edges.forEach((edge) => {
			pushed[edge.to] = Math.max(pushed[edge.to], pushed[edge.from] + edge.columns);
		});
	}
	return pushed;
}

function pulledToTheirForks(columns: Columns, handoverEdges: OrderingEdge[]): Columns {
	const pulled = { ...columns };
	handoverEdges.forEach((edge) => {
		const givenTo = handoverEdges.filter((other) => other.from === edge.from);
		const natural = Math.min(...givenTo.map((other) => columns[other.to] - other.columns));
		pulled[edge.from] = Math.max(pulled[edge.from], natural);
	});
	return pulled;
}

function hasAnyMoved(before: Columns, after: Columns): boolean {
	return Object.keys(after).some((stationId) => after[stationId] !== before[stationId]);
}

export function assignColumns(stationIds: string[], edges: OrderingEdge[], floors: Columns): Columns {
	const passes = stationIds.length;
	const starts = Object.fromEntries(stationIds.map((stationId) => [stationId, floors[stationId] ?? 0]));
	let columns = pushedRight(starts, edges, passes);
	const handoverEdges = edges.filter((edge) => edge.isHandover);
	for (let round = 0; round < passes; round += 1) {
		const settled = pushedRight(pulledToTheirForks(columns, handoverEdges), edges, passes);
		const hasMoved = hasAnyMoved(columns, settled);
		columns = settled;
		if (!hasMoved) break;
	}
	return columns;
}
