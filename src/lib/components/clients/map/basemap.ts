import { env } from '$env/dynamic/public';

export type Basemap = { tileUrl: string; attribution: string; maxZoom: number };

const ordnanceSurveyTileUrl = 'https://api.os.uk/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png?key=';
const ordnanceSurveyDeepestOpenZoom = 16;
const openStreetMapTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const openStreetMapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const openStreetMapDeepestZoom = 19;

/** Ordnance Survey's Light style on the free OpenData plan when a key is set; OpenStreetMap only as the fallback. */
export function basemapFor(ordnanceSurveyKey: string, year: number): Basemap {
	if (ordnanceSurveyKey === '') {
		return { tileUrl: openStreetMapTileUrl, attribution: openStreetMapAttribution, maxZoom: openStreetMapDeepestZoom };
	}
	return {
		tileUrl: `${ordnanceSurveyTileUrl}${encodeURIComponent(ordnanceSurveyKey)}`,
		attribution: `Contains OS data &copy; Crown copyright and database rights ${year}`,
		maxZoom: ordnanceSurveyDeepestOpenZoom
	};
}

export function currentBasemap(): Basemap {
	return basemapFor(env.PUBLIC_OS_MAPS_API_KEY ?? '', new Date().getFullYear());
}

export function addBasemapTo(leaflet: typeof import('leaflet'), map: import('leaflet').Map): void {
	const basemap = currentBasemap();
	leaflet.tileLayer(basemap.tileUrl, { attribution: basemap.attribution, maxZoom: basemap.maxZoom }).addTo(map);
}
