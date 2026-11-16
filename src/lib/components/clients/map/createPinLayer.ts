import { pinTones, resolveColourToken, standingOfPin } from './areaPinTones';
import type { AreaPin } from '$lib/server/clients/area/areaPin';

type Leaflet = typeof import('leaflet');
type SelectPin = (key: string) => void;
type DrawnPin = { pin: AreaPin; marker: import('leaflet').CircleMarker };

export type PinLayerHandle = { showPins: (pins: AreaPin[], selectedKey: string | null, onSelect: SelectPin) => void };

const pinRadiusPixels = 7;
const selectedPinRadiusPixels = 11;
const pinOutlineWeight = 1.5;
const selectedPinOutlineWeight = 3;
const selectedOutlineColourToken = '--color-chalk';

/**
 * The pins of a map, each drawn once and only restyled when another is picked: a territory holds tens of
 * thousands, and drawing every one again for each pick kept the map waiting.
 */
export function createPinLayer(leaflet: Leaflet, map: import('leaflet').Map): PinLayerHandle {
	const layer = leaflet.layerGroup().addTo(map);
	const drawnByKey = new Map<string, DrawnPin>();
	let latest = { pins: [] as AreaPin[], selectedKey: null as string | null, onSelect: (_key: string) => {} };
	const drawEvery = (pins: AreaPin[]) => {
		layer.clearLayers();
		drawnByKey.clear();
		for (const pin of pins) drawnByKey.set(pin.key, { pin, marker: markerFor(leaflet, pin, (key) => latest.onSelect(key)).addTo(layer) });
	};
	const restyle = (key: string | null, isSelected: boolean) => {
		const drawn = key === null ? undefined : drawnByKey.get(key);
		if (drawn === undefined) return;
		const { pin, marker } = drawn;
		marker.setStyle(pinStyle(pin, isSelected));
	};
	return {
		showPins: (pins, selectedKey, onSelect) => {
			if (pins !== latest.pins) drawEvery(pins);
			restyle(latest.selectedKey, false);
			restyle(selectedKey, true);
			latest = { pins, selectedKey, onSelect };
		}
	};
}

function markerFor(leaflet: Leaflet, pin: AreaPin, onSelect: SelectPin) {
	const marker = leaflet.circleMarker([pin.latitude, pin.longitude], pinStyle(pin, false));
	marker.bindTooltip(pin.name);
	marker.on('click', () => onSelect(pin.key));
	return marker;
}

function pinStyle(pin: AreaPin, isSelected: boolean): import('leaflet').CircleMarkerOptions {
	const tone = pinTones[standingOfPin(pin)];
	const colour = resolveColourToken(tone.colourToken);
	return {
		radius: isSelected ? selectedPinRadiusPixels : pinRadiusPixels,
		color: isSelected ? resolveColourToken(selectedOutlineColourToken) : colour,
		fillColor: colour,
		fillOpacity: tone.fillOpacity,
		weight: isSelected ? selectedPinOutlineWeight : pinOutlineWeight
	};
}
