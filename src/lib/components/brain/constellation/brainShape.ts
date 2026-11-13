import { Vector3 } from 'three';
import { shareStreamFrom } from './pseudoRandom';

export const BRAIN_HALF_WIDTH = 3.1;
export const BRAIN_HALF_HEIGHT = 2.3;
export const BRAIN_HALF_LENGTH = 4.1;
const FISSURE_HALF_WIDTH = 0.22;
const FISSURE_FLOOR = 0.6;
const UNDERSIDE_FLOOR = -1.7;
const CEREBELLUM_CENTRE = new Vector3(0, -1.15, -2.4);
const CEREBELLUM_RADII = new Vector3(1.7, 1.05, 1.35);
const SAMPLE_ATTEMPT_LIMIT = 40;

const lobeAnchors = [
	new Vector3(0.55, 0.45, 2.6),
	new Vector3(-0.6, 0.75, -0.4),
	new Vector3(0.7, 0.1, -2.8),
	new Vector3(-1.9, -0.7, 0.9),
	new Vector3(1.9, -0.7, -0.6),
	new Vector3(-0.6, 0.4, 2.5),
	new Vector3(0.8, 1.0, 0.3),
	new Vector3(0, -1.1, -2.4)
];

export function lobeAnchorFor(index: number): Vector3 {
	return lobeAnchors[index % lobeAnchors.length].clone();
}

export function isInsideBrain(point: Vector3): boolean {
	if (isInsideCerebellum(point)) return true;
	if (point.y < UNDERSIDE_FLOOR) return false;
	if (isInsideFissure(point)) return false;
	return ellipsoidField(point, BRAIN_HALF_WIDTH, BRAIN_HALF_HEIGHT, BRAIN_HALF_LENGTH) <= 1;
}

export function brainDepthShare(point: Vector3): number {
	return Math.sqrt(ellipsoidField(point, BRAIN_HALF_WIDTH, BRAIN_HALF_HEIGHT, BRAIN_HALF_LENGTH));
}

export function sampleInsideCortex(nextShare: () => number, shallowestShare: number): Vector3 {
	for (let attempt = 0; attempt < SAMPLE_ATTEMPT_LIMIT; attempt += 1) {
		const candidate = sampleInsideBrain(nextShare);
		if (brainDepthShare(candidate) >= shallowestShare) return candidate;
	}
	return sampleInsideBrain(nextShare);
}

export function brainPointFrom(seedText: string): Vector3 {
	return sampleInsideBrain(shareStreamFrom(seedText));
}

export function sampleInsideBrain(nextShare: () => number): Vector3 {
	for (let attempt = 0; attempt < SAMPLE_ATTEMPT_LIMIT; attempt += 1) {
		const candidate = new Vector3(
			(nextShare() * 2 - 1) * BRAIN_HALF_WIDTH,
			(nextShare() * 2 - 1) * BRAIN_HALF_HEIGHT,
			(nextShare() * 2 - 1) * BRAIN_HALF_LENGTH
		);
		if (isInsideBrain(candidate)) return candidate;
	}
	return CEREBELLUM_CENTRE.clone();
}

function isInsideFissure(point: Vector3): boolean {
	return Math.abs(point.x) < FISSURE_HALF_WIDTH && point.y > FISSURE_FLOOR;
}

function isInsideCerebellum(point: Vector3): boolean {
	const offset = point.clone().sub(CEREBELLUM_CENTRE);
	return ellipsoidField(offset, CEREBELLUM_RADII.x, CEREBELLUM_RADII.y, CEREBELLUM_RADII.z) <= 1;
}

function ellipsoidField(point: Vector3, halfWidth: number, halfHeight: number, halfLength: number) {
	const acrossShare = point.x / halfWidth;
	const upShare = point.y / halfHeight;
	const alongShare = point.z / halfLength;
	return acrossShare * acrossShare + upShare * upShare + alongShare * alongShare;
}
