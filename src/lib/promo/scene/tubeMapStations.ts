import { CylinderGeometry, Group, Mesh, MeshBasicMaterial, Vector3, type Sprite, type SpriteMaterial } from 'three';
import { beatsInto } from '../promoTimeline';
import { easeOutBack, progressBetween } from '../promoMotion';
import type { FadeGroup } from './fadeGroup';
import { createLabelSprite } from './labelSprite';
import type { PromoPalette } from './promoPalette';
import { offsetFrom, promoSets } from './promoSets';
import { trackShape } from './tubeMapGeometry';
import { mapStations, type MapStation } from './tubeMapLayout';

export type MapStations = { update: (seconds: number, presence: number) => void };

type StationMarker = { marker: Group; label: Sprite; labelMaterial: SpriteMaterial };

const disc = { radius: 0.62, interchangeRadius: 1, thickness: 0.3, holeShare: 0.55, sides: 40, brightness: 1.3 };
const popIn = { firstBeat: 0.75, beatsPerStation: 0.32, beats: 0.8 };
const label = { worldHeight: 1.5, weight: 600, lift: 2.3 };
const discHeight = trackShape.height + trackShape.radius;
const labelLift = new Vector3(0, label.lift, 0);

function createDisc(radius: number, material: MeshBasicMaterial): Mesh {
	return new Mesh(new CylinderGeometry(radius, radius, disc.thickness, disc.sides), material);
}

function createMarker(station: MapStation, palette: PromoPalette, fades: FadeGroup): Group {
	const marker = new Group();
	const radius = station.isInterchange ? disc.interchangeRadius : disc.radius;
	const discColour = palette.chalk.clone().multiplyScalar(disc.brightness);
	marker.add(createDisc(radius, fades.add(new MeshBasicMaterial({ color: discColour }))));
	if (station.isInterchange) {
		const hole = createDisc(radius * disc.holeShare, fades.add(new MeshBasicMaterial({ color: palette.night })));
		hole.position.setY(disc.thickness / 2);
		marker.add(hole);
	}
	marker.position.copy(offsetFrom(promoSets.map, station.x, discHeight, station.z));
	return marker;
}

function createStationMarker(station: MapStation, palette: PromoPalette, fades: FadeGroup): StationMarker {
	const marker = createMarker(station, palette, fades);
	const labelSprite = createLabelSprite(station.name, palette, label);
	labelSprite.position.copy(marker.position).add(labelLift);
	return { marker, label: labelSprite, labelMaterial: labelSprite.material };
}

function popStation(station: StationMarker, popped: number, presence: number): void {
	const { marker, label: labelSprite, labelMaterial } = station;
	marker.scale.setScalar(Math.max(0, popped));
	labelSprite.visible = popped > 0 && presence > 0;
	labelMaterial.opacity = Math.min(1, popped) * presence;
}

/** The hand-offs on the map, each popping into place with its name as the lines reach it. */
export function createMapStations(group: Group, palette: PromoPalette, fades: FadeGroup): MapStations {
	const markers = mapStations.map((station) => createStationMarker(station, palette, fades));
	markers.forEach(({ marker, label: labelSprite }) => group.add(marker, labelSprite));
	const update = (seconds: number, presence: number) => {
		const mapBeats = beatsInto('map', seconds);
		markers.forEach((station, index) => {
			const start = popIn.firstBeat + index * popIn.beatsPerStation;
			popStation(station, easeOutBack(progressBetween(mapBeats, start, start + popIn.beats)), presence);
		});
	};
	return { update };
}
