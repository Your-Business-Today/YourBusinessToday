import { hasAnythingKnown } from '$lib/data/buildingNeighbours';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import type { Building } from '$lib/server/buildings/buildingRecord';

/** Footprints appear from this zoom, when a street is wide enough to tell buildings apart. */
export const buildingsVisibleFromZoom = 16;

export const buildingOutlineWeight = 1;
export const selectedBuildingOutlineWeight = 2.5;
const knownColourToken = '--color-go';
const unknownColourToken = '--color-chalk';
export const selectedBuildingColourToken = '--color-signal';

/** More places, a deeper fill: nothing, a house, a small block, a large one. */
const fillBands: [number, number][] = [
	[0, 0.05],
	[1, 0.15],
	[6, 0.3],
	[21, 0.45]
];

export function buildingFillOpacity(uprnCount: number): number {
	return fillBands.filter(([from]) => uprnCount >= from).map(([, opacity]) => opacity).pop() ?? 0;
}

/** Green where a business is known in or beside it; chalk where nothing is known yet, which is where a Claude goes next. */
export function buildingColourToken(building: Building, pins: AreaPin[]): string {
	return hasAnythingKnown(building, pins) ? knownColourToken : unknownColourToken;
}
