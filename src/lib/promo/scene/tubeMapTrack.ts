import {
	AdditiveBlending,
	Mesh,
	MeshBasicMaterial,
	Sprite,
	SpriteMaterial,
	type Color,
	type CurvePath,
	type Group,
	type Texture,
	type Vector3
} from 'three';
import { beatsInto } from '../promoTimeline';
import { easeInOutCubic, progressBetween } from '../promoMotion';
import type { FadeGroup } from './fadeGroup';
import { indicesForShare, trackGeometry, trackPath, trackShape } from './tubeMapGeometry';
import type { MapLine } from './tubeMapLayout';

export type MapTrack = { update: (seconds: number) => void };

type TrackLook = { colour: Color; glow: Texture; group: Group; fades: FadeGroup };

const coreBrightness = 1.4;
const sleeve = { widthTimes: 3.4, opacity: 0.17 };
const pulse = { count: 3, size: 1.7, unitsPerSecond: 8, brightness: 4 };
const reveal = { firstBeat: 0.5, beatsPerLine: 0.75, drawBeats: 4 };

function revealShare(line: MapLine, seconds: number): number {
	const start = reveal.firstBeat + line.colourIndex * reveal.beatsPerLine;
	const mapBeats = beatsInto('map', seconds);
	return easeInOutCubic(progressBetween(mapBeats, start, start + reveal.drawBeats));
}

function createPulse(look: TrackLook): Sprite {
	const colour = look.colour.clone().multiplyScalar(pulse.brightness);
	const material = new SpriteMaterial({ map: look.glow, color: colour, blending: AdditiveBlending, depthWrite: false });
	const sprite = new Sprite(look.fades.add(material));
	sprite.scale.setScalar(pulse.size);
	return sprite;
}

function placePulse(sprite: Sprite, path: CurvePath<Vector3>, along: number, share: number): void {
	sprite.visible = along < share;
	sprite.position.copy(path.getPointAt(along));
}

/** One coloured line of the map: drawn on from its first station, with light running along it once it is there. */
export function createMapTrack(line: MapLine, look: TrackLook): MapTrack {
	const path = trackPath(line);
	const length = path.getLength();
	const coreMaterial = new MeshBasicMaterial({ color: look.colour.clone().multiplyScalar(coreBrightness) });
	const sleeveMaterial = new MeshBasicMaterial({ color: look.colour, blending: AdditiveBlending, depthWrite: false });
	sleeveMaterial.opacity = sleeve.opacity;
	const core = new Mesh(trackGeometry(path, trackShape.radius), look.fades.add(coreMaterial));
	const glowSleeve = new Mesh(trackGeometry(path, trackShape.radius * sleeve.widthTimes), look.fades.add(sleeveMaterial));
	const pulses = Array.from({ length: pulse.count }, () => createPulse(look));
	look.group.add(core, glowSleeve, ...pulses);
	const update = (seconds: number) => {
		const share = revealShare(line, seconds);
		const indices = indicesForShare(share);
		core.geometry.setDrawRange(0, indices);
		glowSleeve.geometry.setDrawRange(0, indices);
		const travelled = (seconds * pulse.unitsPerSecond) / length;
		pulses.forEach((sprite, index) => placePulse(sprite, path, (travelled + index / pulse.count) % 1, share));
	};
	return { update };
}
