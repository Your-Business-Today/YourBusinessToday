import { PerspectiveCamera, WebGLRenderer } from 'three';
import { screen } from '$lib/client/screen.svelte';
import { untrack } from 'svelte';

const DEFAULT_FIELD_OF_VIEW_DEGREES = 42;
const DEFAULT_FAR_PLANE = 90;
const NEAR_PLANE = 0.1;
const PIXEL_RATIO_LIMIT_ON_WIDE_SCREENS = 2;
const PIXEL_RATIO_LIMIT_ON_NARROW_SCREENS = 1.5;

export type StageOptions = { fieldOfViewDegrees?: number; farPlane?: number };

export type Stage = {
	renderer: WebGLRenderer;
	camera: PerspectiveCamera;
	resize: (width: number, height: number) => void;
	dispose: () => void;
};

/** A stage is built for the screen it starts on; crossing the breakpoint later must not rebuild the scene. */
export function createStage(canvas: HTMLCanvasElement, options: StageOptions = {}): Stage {
	const isWideScreen = untrack(() => screen.isWideScreen);
	const renderer = new WebGLRenderer({
		canvas,
		antialias: true,
		powerPreference: isWideScreen ? 'high-performance' : 'default'
	});
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelRatioLimit(isWideScreen)));

	const fieldOfView = options.fieldOfViewDegrees ?? DEFAULT_FIELD_OF_VIEW_DEGREES;
	const farPlane = options.farPlane ?? DEFAULT_FAR_PLANE;
	const camera = new PerspectiveCamera(fieldOfView, 1, NEAR_PLANE, farPlane);

	function resize(width: number, height: number): void {
		renderer.setSize(width, height, false);
		camera.aspect = width / Math.max(1, height);
		camera.updateProjectionMatrix();
	}

	function dispose(): void {
		renderer.dispose();
		renderer.forceContextLoss();
	}

	return { renderer, camera, resize, dispose };
}

function pixelRatioLimit(isWideScreen: boolean): number {
	return isWideScreen ? PIXEL_RATIO_LIMIT_ON_WIDE_SCREENS : PIXEL_RATIO_LIMIT_ON_NARROW_SCREENS;
}

export function fitStageTo(
	stage: Stage,
	container: HTMLElement,
	onResized: () => void = () => {}
): ResizeObserver {
	const observer = new ResizeObserver(() => {
		stage.resize(container.clientWidth, container.clientHeight);
		onResized();
	});
	observer.observe(container);
	stage.resize(container.clientWidth, container.clientHeight);
	return observer;
}
