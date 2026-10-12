import { env } from '$env/dynamic/public';

/** One tile source and the zoom range it covers. */
export type TileSource = { tileUrl: string; attribution: string; minZoom: number; maxZoom: number };

const ordnanceSurveyTileUrl = 'https://api.os.uk/maps/raster/v1/zxy/Light_3857/{z}/{x}/{y}.png?key=';
const ordnanceSurveyShallowestZoom = 7;
const ordnanceSurveyDeepestOpenZoom = 16;
const openStreetMapTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const openStreetMapAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
const shallowestZoom = 0;
const openStreetMapDeepestZoom = 19;

/**
 * Ordnance Survey's Light style on the free OpenData plan from the zoom it serves downwards, with
 * OpenStreetMap, credited, for the country-wide view above it; OpenStreetMap alone without a key.
 */
export function basemapFor(ordnanceSurveyKey: string, year: number): TileSource[] {
	if (ordnanceSurveyKey === '') {
		return [{ tileUrl: openStreetMapTileUrl, attribution: openStreetMapAttribution, minZoom: shallowestZoom, maxZoom: openStreetMapDeepestZoom }];
	}
	return [
		{ tileUrl: openStreetMapTileUrl, attribution: openStreetMapAttribution, minZoom: shallowestZoom, maxZoom: ordnanceSurveyShallowestZoom - 1 },
		{
			tileUrl: `${ordnanceSurveyTileUrl}${encodeURIComponent(ordnanceSurveyKey)}`,
			attribution: `Contains OS data &copy; Crown copyright and database rights ${year}`,
			minZoom: ordnanceSurveyShallowestZoom,
			maxZoom: ordnanceSurveyDeepestOpenZoom
		}
	];
}

export function currentBasemap(): TileSource[] {
	return basemapFor(env.PUBLIC_OS_MAPS_API_KEY ?? '', new Date().getFullYear());
}

export function addBasemapTo(leaflet: typeof import('leaflet'), map: import('leaflet').Map): void {
	for (const source of currentBasemap()) {
		leaflet
			.tileLayer(source.tileUrl, { attribution: source.attribution, minZoom: source.minZoom, maxZoom: source.maxZoom })
			.addTo(map);
	}
}
