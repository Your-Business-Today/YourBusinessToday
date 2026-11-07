import {
	FogExp2,
	HalfFloatType,
	NeutralToneMapping,
	PerspectiveCamera,
	PMREMGenerator,
	Scene,
	SRGBColorSpace,
	Vector2,
	WebGLRenderer,
	WebGLRenderTarget
} from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import type { Texture } from 'three';
import type { PromoPalette } from './promoPalette';

export type PromoStage = {
	scene: Scene;
	camera: PerspectiveCamera;
	resize: (width: number, height: number, pixelRatio: number) => void;
	render: () => void;
	dispose: () => void;
};

const lens = { fieldOfView: 40, near: 0.1, far: 900 };
const bloomLook = { strength: 0.8, radius: 0.25, threshold: 0.9 };
const toneMappingExposure = 1;
const fogDensity = 0.0105;
const multisampleCount = 4;
const environmentBlur = 0.04;

function createRenderer(canvas: HTMLCanvasElement): WebGLRenderer {
	const renderer = new WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
	renderer.toneMapping = NeutralToneMapping;
	renderer.toneMappingExposure = toneMappingExposure;
	renderer.outputColorSpace = SRGBColorSpace;
	return renderer;
}

function createEnvironment(renderer: WebGLRenderer): Texture {
	const generator = new PMREMGenerator(renderer);
	const lighting = generator.fromScene(new RoomEnvironment(), environmentBlur);
	generator.dispose();
	return lighting.texture;
}

function createComposer(renderer: WebGLRenderer, scene: Scene, camera: PerspectiveCamera) {
	const target = new WebGLRenderTarget(1, 1, { type: HalfFloatType, samples: multisampleCount });
	const composer = new EffectComposer(renderer, target);
	const bloom = new UnrealBloomPass(new Vector2(1, 1), bloomLook.strength, bloomLook.radius, bloomLook.threshold);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(bloom);
	composer.addPass(new OutputPass());
	return composer;
}

/** The renderer, scene, camera and glow every piece of the film is drawn through. */
export function createPromoStage(canvas: HTMLCanvasElement, palette: PromoPalette): PromoStage {
	const renderer = createRenderer(canvas);
	const scene = new Scene();
	scene.background = palette.night;
	scene.fog = new FogExp2(palette.night, fogDensity);
	scene.environment = createEnvironment(renderer);
	const camera = new PerspectiveCamera(lens.fieldOfView, 1, lens.near, lens.far);
	const composer = createComposer(renderer, scene, camera);
	const resize = (width: number, height: number, pixelRatio: number) => {
		renderer.setPixelRatio(pixelRatio);
		renderer.setSize(width, height, false);
		composer.setPixelRatio(pixelRatio);
		composer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};
	const dispose = () => {
		composer.dispose();
		renderer.dispose();
	};
	return { scene, camera, resize, render: () => composer.render(), dispose };
}
