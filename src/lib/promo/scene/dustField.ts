import {
	AdditiveBlending,
	BufferGeometry,
	Float32BufferAttribute,
	Points,
	PointsMaterial,
	type Scene
} from 'three';
import { randomBetween, seededRandom } from '../promoRandom';
import { createGlowTexture } from './glowTexture';
import type { PromoPalette } from './promoPalette';

export type DustField = { update: (seconds: number) => void };

const moteCount = 1800;
const moteSeed = 7;
const moteLook = { size: 0.22, opacity: 0.55 };
const driftPerSecond = 0.004;
const volume = { left: -80, right: 80, bottom: -30, top: 75, back: -130, front: 45 };

function scatterMotes(): Float32BufferAttribute {
	const random = seededRandom(moteSeed);
	const coordinates: number[] = [];
	for (let mote = 0; mote < moteCount; mote += 1) {
		coordinates.push(
			randomBetween(random, volume.left, volume.right),
			randomBetween(random, volume.bottom, volume.top),
			randomBetween(random, volume.back, volume.front)
		);
	}
	return new Float32BufferAttribute(coordinates, 3);
}

/** Specks of light hanging in the air, so the camera always has depth to move through. */
export function createDustField(scene: Scene, palette: PromoPalette): DustField {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', scatterMotes());
	const material = new PointsMaterial({
		size: moteLook.size,
		map: createGlowTexture(),
		color: palette.chalk,
		transparent: true,
		opacity: moteLook.opacity,
		blending: AdditiveBlending,
		depthWrite: false
	});
	const motes = new Points(geometry, material);
	scene.add(motes);
	return { update: (seconds) => motes.rotation.set(0, seconds * driftPerSecond, 0) };
}
