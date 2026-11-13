import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PerspectiveCamera } from 'three';

const DAMPING_FACTOR = 0.06;
const NEAREST_ORBIT = 1.1;
const FARTHEST_ORBIT = 45;
const IDLE_ROTATION_SPEED = 0.35;

export function createOrbitRig(camera: PerspectiveCamera, canvas: HTMLCanvasElement): OrbitControls {
	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = DAMPING_FACTOR;
	controls.enablePan = false;
	controls.minDistance = NEAREST_ORBIT;
	controls.maxDistance = FARTHEST_ORBIT;
	controls.autoRotateSpeed = IDLE_ROTATION_SPEED;
	controls.autoRotate = !prefersReducedMotion();
	return controls;
}

export function prefersReducedMotion(): boolean {
	return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
