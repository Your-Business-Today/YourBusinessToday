import { BufferGeometry, Float32BufferAttribute, Points, PointsMaterial } from 'three';
import { STARLIGHT } from './constellationPalette';

const STAR_COUNT = 400;
const NEAREST_STAR_RADIUS = 26;
const STAR_SHELL_DEPTH = 30;
const STAR_SIZE = 0.1;
const STAR_OPACITY = 0.45;

export type StarBackdrop = { points: Points; dispose: () => void };

export function createStarBackdrop(): StarBackdrop {
	const positions: number[] = [];
	for (let index = 0; index < STAR_COUNT; index += 1) {
		positions.push(...randomShellPosition());
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
	const material = new PointsMaterial({
		color: STARLIGHT,
		size: STAR_SIZE,
		transparent: true,
		opacity: STAR_OPACITY,
		depthWrite: false,
		fog: false
	});
	const points = new Points(geometry, material);

	function dispose(): void {
		geometry.dispose();
		material.dispose();
	}

	return { points, dispose };
}

function randomShellPosition(): [number, number, number] {
	const azimuth = Math.random() * Math.PI * 2;
	const altitude = Math.acos(2 * Math.random() - 1);
	const radius = NEAREST_STAR_RADIUS + Math.random() * STAR_SHELL_DEPTH;
	return [
		radius * Math.sin(altitude) * Math.cos(azimuth),
		radius * Math.cos(altitude),
		radius * Math.sin(altitude) * Math.sin(azimuth)
	];
}
