import { createBuildingLayer, type BuildingLayerHandle } from './createBuildingLayer';
import { createCircleMap } from '$lib/components/clients/map/createCircleMap';
import { createPinLayer, type PinLayerHandle } from '$lib/components/clients/map/createPinLayer';
import { createSectorLayer, type SectorLayerHandle } from './createSectorLayer';
export type { DrawnSector } from './createSectorLayer';
import type { Coordinates } from '$lib/data/distance';

export type PatchMapHandle = SectorLayerHandle & BuildingLayerHandle & PinLayerHandle & { destroy: () => void };

/** The patch map: the sectors beneath, the buildings at street zoom, the pins on top, all selectable. */
export async function createPatchMap(container: HTMLElement, patchId: string, centre: Coordinates, radiusMiles: number): Promise<PatchMapHandle> {
	const { leaflet, map } = await createCircleMap(container, centre, radiusMiles);
	const sectors = createSectorLayer(leaflet, map);
	const buildings = createBuildingLayer(leaflet, map, patchId);
	const pins = createPinLayer(leaflet, map);
	return {
		showSectors: sectors.showSectors,
		showBuildings: buildings.showBuildings,
		showPins: pins.showPins,
		destroy: () => map.remove()
	};
}
