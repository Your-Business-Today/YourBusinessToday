import { stationState, type MapHandover, type MapLine, type MapStation, type WorkflowMapVersion } from './workflowMap';

/** A station planned for one of our products, on its role's line, with what goes wrong in the hand-overs it touches. */
export type PlannedStation = { station: MapStation; lineName: string; goesWrong: string[] };

/** The stations planned for one product, or for a product not named yet: one service each. */
export type PlannedProduct = { productId: string | null; stations: PlannedStation[] };

/** A hand-over that goes wrong today, as the names of the stations either side of it. */
export type TroubledHandover = { fromName: string; toName: string; handedOver: string; goesWrong: string };

/** What a confirmed map suggests building: the stations planned for our products, then the hand-overs that go wrong. */
export type MapServiceOutline = { products: PlannedProduct[]; troubledHandovers: TroubledHandover[] };

type PlacedStation = { station: MapStation; lineName: string };

/** The planned stations grouped by product in the order the map first names them, outputs first within each. */
export function outlineMapServices(map: WorkflowMapVersion): MapServiceOutline {
	const placed = map.lines.flatMap(placedStationsOf);
	const planned = placed.filter(({ station }) => station.state === stationState.planned);
	const productIds = [...new Set(planned.map(({ station }) => station.productId))];
	const products = productIds.map((productId) => {
		const onProduct = planned.filter(({ station }) => station.productId === productId).sort(outputsFirst);
		return { productId, stations: onProduct.map((entry) => withTroubles(entry, map.handovers)) };
	});
	return { products, troubledHandovers: troubledHandoversOf(map.handovers, placed) };
}

function placedStationsOf(line: MapLine): PlacedStation[] {
	return line.stations.map((station) => ({ station, lineName: line.name }));
}

function outputsFirst({ station: first }: PlacedStation, { station: second }: PlacedStation): number {
	return Number(second.isOutput) - Number(first.isOutput);
}

function withTroubles({ station, lineName }: PlacedStation, handovers: MapHandover[]): PlannedStation {
	const touching = handovers.filter((handover) => handover.fromKey === station.key || handover.toKey === station.key);
	const goesWrong = touching.flatMap((handover) => (handover.goesWrong === null ? [] : [handover.goesWrong]));
	return { station, lineName, goesWrong };
}

function troubledHandoversOf(handovers: MapHandover[], placed: PlacedStation[]): TroubledHandover[] {
	const nameOf = new Map(placed.map(({ station }) => [station.key, station.name]));
	return handovers.flatMap(({ fromKey, toKey, handedOver, goesWrong }) => {
		if (goesWrong === null) return [];
		const fromName = nameOf.get(fromKey) ?? fromKey;
		const toName = nameOf.get(toKey) ?? toKey;
		return [{ fromName, toName, handedOver, goesWrong }];
	});
}
