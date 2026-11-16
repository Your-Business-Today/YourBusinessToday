import type { Coordinates } from '$lib/data/distance';
import { createCircleMap } from './createCircleMap';
import { createPinLayer, type PinLayerHandle } from './createPinLayer';

export type AreaMapHandle = PinLayerHandle & { destroy: () => void };

export async function createAreaMap(
	container: HTMLElement,
	centre: Coordinates,
	radiusMiles: number
): Promise<AreaMapHandle> {
	const { leaflet, map } = await createCircleMap(container, centre, radiusMiles);
	const pins = createPinLayer(leaflet, map);
	return { showPins: pins.showPins, destroy: () => map.remove() };
}
