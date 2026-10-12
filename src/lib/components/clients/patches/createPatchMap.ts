import { createCircleMap } from '$lib/components/clients/map/createCircleMap';
import { createSectorLayer, type SectorLayerHandle } from './createSectorLayer';
export type { DrawnSector } from './createSectorLayer';
import { markerFor } from '$lib/components/clients/map/createAreaMap';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import type { Coordinates } from '$lib/data/distance';

export type PatchMapHandle = SectorLayerHandle & {
	showPins: (pins: AreaPin[], selectedKey: string | null, onSelect: (key: string) => void) => void;
	destroy: () => void;
};

/** The patch map: the sectors beneath, the register pins on top, both selectable. */
export async function createPatchMap(container: HTMLElement, centre: Coordinates, radiusMiles: number): Promise<PatchMapHandle> {
	const { leaflet, map } = await createCircleMap(container, centre, radiusMiles);
	const sectors = createSectorLayer(leaflet, map);
	const pinLayer = leaflet.layerGroup().addTo(map);
	return {
		showSectors: sectors.showSectors,
		showPins: (pins, selectedKey, onSelect) => {
			pinLayer.clearLayers();
			for (const pin of pins) pinLayer.addLayer(markerFor(leaflet, pin, pin.key === selectedKey, onSelect));
		},
		destroy: () => map.remove()
	};
}
