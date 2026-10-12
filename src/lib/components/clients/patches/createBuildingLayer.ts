import { mapBoundsQuery } from '$lib/data/mapBounds';
import { resolveColourToken } from '$lib/components/clients/map/areaPinTones';
import {
	buildingColourToken,
	buildingFillOpacity,
	buildingOutlineWeight,
	buildingsVisibleFromZoom,
	selectedBuildingColourToken,
	selectedBuildingOutlineWeight
} from './buildingTones';
import type { AreaPin } from '$lib/server/clients/area/areaPin';
import type { Building } from '$lib/server/buildings/buildingRecord';

type Leaflet = typeof import('leaflet');

export type BuildingLayerHandle = { showBuildings: (pins: AreaPin[], selectedId: string | null, onPick: (building: Building) => void) => void };

/** Footprints fetched for the view whenever the map settles zoomed in, restyled by what the pins say is known in each. */
export function createBuildingLayer(leaflet: Leaflet, map: import('leaflet').Map, patchId: string): BuildingLayerHandle {
	const layer = leaflet.layerGroup().addTo(map);
	let buildings: Building[] = [];
	let latest = { pins: [] as AreaPin[], selectedId: null as string | null, onPick: (_building: Building) => {} };
	const redraw = () => {
		layer.clearLayers();
		if (map.getZoom() < buildingsVisibleFromZoom) return;
		for (const building of buildings) layer.addLayer(shapeFor(leaflet, building, latest.pins, building.id === latest.selectedId, latest.onPick));
	};
	map.on('moveend', async () => {
		buildings = map.getZoom() < buildingsVisibleFromZoom ? [] : await fetchBuildings(patchId, map.getBounds());
		redraw();
	});
	return {
		showBuildings: (pins, selectedId, onPick) => {
			latest = { pins, selectedId, onPick };
			redraw();
		}
	};
}

async function fetchBuildings(patchId: string, bounds: import('leaflet').LatLngBounds): Promise<Building[]> {
	const query = mapBoundsQuery({ north: bounds.getNorth(), south: bounds.getSouth(), east: bounds.getEast(), west: bounds.getWest() });
	const response = await fetch(`/clients/patches/${patchId}/buildings?${query}`);
	if (!response.ok) return [];
	const body = (await response.json()) as { buildings: Building[] };
	return body.buildings;
}

function shapeFor(leaflet: Leaflet, building: Building, pins: AreaPin[], isSelected: boolean, onPick: (building: Building) => void) {
	const colour = resolveColourToken(isSelected ? selectedBuildingColourToken : buildingColourToken(building, pins));
	const shape = leaflet.geoJSON(building.footprint, {
		style: {
			color: colour,
			fillColor: colour,
			fillOpacity: buildingFillOpacity(building.uprnCount),
			weight: isSelected ? selectedBuildingOutlineWeight : buildingOutlineWeight
		}
	});
	shape.bindTooltip(`${building.uprnCount} addressable place${building.uprnCount === 1 ? '' : 's'}`);
	shape.on('click', (click) => {
		leaflet.DomEvent.stopPropagation(click);
		onPick(building);
	});
	return shape;
}
