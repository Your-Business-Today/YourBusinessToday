import { addBasemapTo } from '$lib/components/clients/map/basemap';
import { milesToMetres } from '$lib/data/mapRadii';
import { resolveColourToken } from '$lib/components/clients/map/areaPinTones';
import type { Coordinates } from '$lib/data/distance';
import type { PatchWithCentre } from '$lib/server/patches/listPatchesWithCentres';

export type PatchesOverviewHandle = {
	showPatches: (patches: PatchWithCentre[]) => void;
	destroy: () => void;
};

export type OverviewEvents = { onOpen: (patchId: string) => void; onPick: (point: Coordinates) => void };

const greatBritainSouthWest: [number, number] = [49.8, -8.7];
const greatBritainNorthEast: [number, number] = [60.9, 1.8];
const circleOpacity = 0.3;
const circleWeight = 2;

/** One map of Great Britain with every patch as its circle; a circle opens the patch, bare ground starts one. */
export async function createPatchesOverview(
	container: HTMLElement,
	events: OverviewEvents
): Promise<PatchesOverviewHandle> {
	await import('leaflet/dist/leaflet.css');
	const leaflet = await import('leaflet');
	const map = leaflet.map(container, { scrollWheelZoom: false });
	map.fitBounds([greatBritainSouthWest, greatBritainNorthEast]);
	addBasemapTo(leaflet, map);
	map.on('click', (click) => {
		const { latlng } = click;
		events.onPick({ latitude: latlng.lat, longitude: latlng.lng });
	});
	const patchLayer = leaflet.layerGroup().addTo(map);
	return {
		showPatches: (patches) => {
			patchLayer.clearLayers();
			for (const patch of patches) {
				const { centre } = patch;
				if (centre === null) continue;
				patchLayer.addLayer(circleFor(leaflet, patch, centre, events.onOpen));
			}
		},
		destroy: () => map.remove()
	};
}

function circleFor(
	leaflet: typeof import('leaflet'),
	patch: PatchWithCentre,
	centre: Coordinates,
	onOpen: (patchId: string) => void
) {
	const colour = resolveColourToken('--color-go');
	const circle = leaflet.circle([centre.latitude, centre.longitude], {
		radius: milesToMetres(patch.radiusMiles),
		color: colour,
		fillColor: colour,
		fillOpacity: circleOpacity,
		weight: circleWeight
	});
	circle.bindTooltip(`${patch.name} — ${patch.ownerName}`);
	circle.on('click', (click) => {
		leaflet.DomEvent.stopPropagation(click);
		onOpen(patch.id);
	});
	return circle;
}
