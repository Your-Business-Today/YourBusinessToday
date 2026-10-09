import type { Coordinates } from '$lib/data/distance';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import { pinTones, resolveColourToken, standingOf } from './areaPinTones';
import { milesToMetres } from '$lib/data/mapRadii';

export type AreaMapHandle = {
	showPins: (pins: AreaPin[], selectedKey: string | null, onSelect: (key: string) => void) => void;
	destroy: () => void;
};

const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const tileAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const pinRadiusPixels = 7;
const selectedPinRadiusPixels = 11;
const circleOpacity = 0.15;

export async function createAreaMap(
	container: HTMLElement,
	centre: Coordinates,
	radiusMiles: number
): Promise<AreaMapHandle> {
	await import('leaflet/dist/leaflet.css');
	const leaflet = await import('leaflet');
	const map = leaflet.map(container, { scrollWheelZoom: false });
	const centrePoint = leaflet.latLng(centre.latitude, centre.longitude);
	const radiusMetres = milesToMetres(radiusMiles);
	map.fitBounds(centrePoint.toBounds(radiusMetres * 2));
	leaflet.tileLayer(tileUrl, { attribution: tileAttribution }).addTo(map);
	leaflet
		.circle(centrePoint, {
			radius: radiusMetres,
			color: resolveColourToken('--color-go'),
			fillOpacity: circleOpacity,
			weight: 1
		})
		.addTo(map);
	const pinLayer = leaflet.layerGroup().addTo(map);
	return {
		showPins: (pins, selectedKey, onSelect) => {
			pinLayer.clearLayers();
			for (const pin of pins) pinLayer.addLayer(markerFor(leaflet, pin, pin.key === selectedKey, onSelect));
		},
		destroy: () => map.remove()
	};
}

function markerFor(
	leaflet: typeof import('leaflet'),
	pin: AreaPin,
	isSelected: boolean,
	onSelect: (key: string) => void
) {
	const { standing } = pin;
	const tone = pinTones[standingOf(standing?.stage ?? null)];
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
