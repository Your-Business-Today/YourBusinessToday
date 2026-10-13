import { resolveColourToken } from '$lib/components/clients/map/areaPinTones';
import {
	sectorDrawRadiusMetres,
	sectorOutlineWeight,
	sectorTones,
	selectedSectorColourToken,
	selectedSectorOutlineWeight,
	staleDashPattern
} from './sectorTones';
import type { PostcodeSector } from '$lib/server/sectors/postcodeSectorRecord';
import type { SectorCoverage } from '$lib/data/sectorCoverage';

type Leaflet = typeof import('leaflet');

/** What the layer draws for one sector: the ground, whether it has a shape, its coverage, and the initials of whoever holds it. */
export type DrawnSector = { name: string; sector: PostcodeSector; hasShape: boolean; coverage: SectorCoverage; holderInitials: string };

export type SectorLayerHandle = {
	showSectors: (drawn: DrawnSector[], selectedSector: string | null, onPick: (sector: string) => void) => void;
};

/** Every sector of the patch, tinted by its coverage, labelled, and clickable; a shape where one is drawn, a circle where not. */
export function createSectorLayer(leaflet: Leaflet, map: import('leaflet').Map): SectorLayerHandle {
	const layer = leaflet.layerGroup().addTo(map);
	return {
		showSectors: (drawn, selectedSector, onPick) => {
			layer.clearLayers();
			for (const entry of drawn) layer.addLayer(shapeFor(leaflet, entry, entry.name === selectedSector, onPick));
		}
	};
}

function shapeFor(leaflet: Leaflet, drawn: DrawnSector, isSelected: boolean, onPick: (sector: string) => void) {
	const { sector, coverage } = drawn;
	const tone = sectorTones[coverage.state];
	const style = {
		color: resolveColourToken(isSelected ? selectedSectorColourToken : tone.colourToken),
		fillColor: resolveColourToken(tone.colourToken),
		fillOpacity: tone.fillOpacity,
		weight: isSelected ? selectedSectorOutlineWeight : sectorOutlineWeight,
		dashArray: tone.isDashed ? staleDashPattern : undefined
	};
	const shape =
		sector.boundary === null
			? leaflet.circle([sector.latitude, sector.longitude], { radius: sectorDrawRadiusMetres, ...style })
			: leaflet.geoJSON(sector.boundary, { style });
	shape.bindTooltip(labelFor(drawn), { permanent: true, direction: 'center', className: 'sector-label' });
	shape.on('click', (click) => {
		leaflet.DomEvent.stopPropagation(click);
		onPick(drawn.name);
	});
	return shape;
}

function labelFor(drawn: DrawnSector): string {
	if (drawn.holderInitials === '') return drawn.name;
	return `${drawn.name} · ${drawn.holderInitials}`;
}
