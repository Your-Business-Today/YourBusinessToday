import { GridCellIndex } from './gridCellIndex';
import { isPointInPolygon } from '$lib/data/pointInPolygon';
import type { Footprint } from './buildingFootprint';
import type { UprnPoint } from './uprnRows';

/** A building with the addressable places that fall inside its footprint. */
export type PlacedBuilding = { footprint: Footprint; uprns: number[] };

/** Every UPRN point is put in the one footprint it falls inside; the rest stand outside every building. */
export function placeUprnsInBuildings(footprints: Footprint[], points: UprnPoint[]): { buildings: PlacedBuilding[]; outside: UprnPoint[] } {
	const index = new GridCellIndex<PlacedBuilding>();
	const buildings = footprints.map((footprint) => ({ footprint, uprns: [] as number[] }));
	for (const building of buildings) {
		const { footprint } = building;
		index.add(building, footprint.bounds);
	}
	const outside: UprnPoint[] = [];
	for (const point of points) {
		const home = index.near(point.eastings, point.northings).find((building) => holds(building, point));
		if (home === undefined) outside.push(point);
		if (home !== undefined) home.uprns.push(point.uprn);
	}
	return { buildings, outside };
}

function holds(building: PlacedBuilding, point: UprnPoint): boolean {
	const { footprint } = building;
	return isPointInPolygon([point.eastings, point.northings], footprint.rings);
}
