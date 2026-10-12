import type { Coordinates } from '$lib/data/distance';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import { createCircleMap } from './createCircleMap';
import { pinTones, resolveColourToken, standingOfPin } from './areaPinTones';

export type AreaMapHandle = {
	showPins: (pins: AreaPin[], selectedKey: string | null, onSelect: (key: string) => void) => void;
	destroy: () => void;
};

const pinRadiusPixels = 7;
const selectedPinRadiusPixels = 11;

export async function createAreaMap(
	container: HTMLElement,
	centre: Coordinates,
	radiusMiles: number
): Promise<AreaMapHandle> {
	const { leaflet, map } = await createCircleMap(container, centre, radiusMiles);
	const pinLayer = leaflet.layerGroup().addTo(map);
	return {
		showPins: (pins, selectedKey, onSelect) => {
			pinLayer.clearLayers();
			for (const pin of pins) pinLayer.addLayer(markerFor(leaflet, pin, pin.key === selectedKey, onSelect));
		},
		destroy: () => map.remove()
	};
}

export function markerFor(
	leaflet: typeof import('leaflet'),
	pin: AreaPin,
	isSelected: boolean,
	onSelect: (key: string) => void
) {
	const tone = pinTones[standingOfPin(pin)];
	const colour = resolveColourToken(tone.colourToken);
	const marker = leaflet.circleMarker([pin.latitude, pin.longitude], {
		radius: isSelected ? selectedPinRadiusPixels : pinRadiusPixels,
		color: isSelected ? resolveColourToken('--color-chalk') : colour,
		fillColor: colour,
		fillOpacity: tone.fillOpacity,
		weight: isSelected ? 3 : 1.5
	});
	marker.bindTooltip(pin.name);
	marker.on('click', () => onSelect(pin.key));
	return marker;
}
