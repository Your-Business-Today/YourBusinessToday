import { addBasemapTo } from './basemap';
import { milesToMetres } from '$lib/data/mapRadii';
import { resolveColourToken } from './areaPinTones';
import type { Coordinates } from '$lib/data/distance';

export type CircleMap = { leaflet: typeof import('leaflet'); map: import('leaflet').Map };

const circleOpacity = 0.15;

/** A map fitted to a circle of the radius around the centre, the circle drawn, the basemap beneath: what every area map starts from. */
export async function createCircleMap(container: HTMLElement, centre: Coordinates, radiusMiles: number): Promise<CircleMap> {
	await import('leaflet/dist/leaflet.css');
	const leaflet = await import('leaflet');
	const map = leaflet.map(container, { scrollWheelZoom: false, preferCanvas: true });
	const centrePoint = leaflet.latLng(centre.latitude, centre.longitude);
	const radiusMetres = milesToMetres(radiusMiles);
	map.fitBounds(centrePoint.toBounds(radiusMetres * 2));
	addBasemapTo(leaflet, map);
	leaflet
		.circle(centrePoint, { radius: radiusMetres, color: resolveColourToken('--color-go'), fillOpacity: circleOpacity, weight: 1 })
		.addTo(map);
	return { leaflet, map };
}
