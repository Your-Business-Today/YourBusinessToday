import { Vector3, type PerspectiveCamera } from 'three';

const DEFAULT_FLIGHT_SECONDS = 1.4;

export type FlightOptions = { seconds?: number; ease?: (progress: number) => number };

export type CameraFlight = {
	flyTo: (destination: Vector3, target: Vector3) => void;
	update: (camera: PerspectiveCamera, orbitTarget: Vector3, deltaSeconds: number) => void;
	isFlying: () => boolean;
};

export function createCameraFlight(
	camera: PerspectiveCamera,
	orbitTarget: Vector3,
	options: FlightOptions = {}
): CameraFlight {
	const flightSeconds = options.seconds ?? DEFAULT_FLIGHT_SECONDS;
	const ease = options.ease ?? easeInOutCubic;
	const fromPosition = new Vector3();
	const fromTarget = new Vector3();
	const toPosition = new Vector3();
	const toTarget = new Vector3();
	let elapsedSeconds = 0;
	let isActive = false;

	function flyTo(destination: Vector3, target: Vector3): void {
		fromPosition.copy(camera.position);
		fromTarget.copy(orbitTarget);
		toPosition.copy(destination);
		toTarget.copy(target);
		elapsedSeconds = 0;
		isActive = true;
	}

	function update(
		flownCamera: PerspectiveCamera,
		flownTarget: Vector3,
		deltaSeconds: number
	): void {
		if (!isActive) return;
		elapsedSeconds += deltaSeconds;
		const progress = Math.min(1, elapsedSeconds / flightSeconds);
		const eased = ease(progress);
		flownCamera.position.lerpVectors(fromPosition, toPosition, eased);
		flownTarget.lerpVectors(fromTarget, toTarget, eased);
		if (progress >= 1) isActive = false;
	}

	return { flyTo, update, isFlying: () => isActive };
}

function easeInOutCubic(progress: number): number {
	if (progress < 0.5) return 4 * progress * progress * progress;
	return 1 - Math.pow(-2 * progress + 2, 3) / 2;
}
