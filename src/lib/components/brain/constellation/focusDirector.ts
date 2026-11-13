import { createCameraFlight, type CameraFlight } from './cameraFlight';
import { contextViewpoint, homeViewpoint, neuronViewpoint, type Viewpoint } from './focusChoreography';
import { WHOLE_MODEL_KEY } from './materialBank';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { PerspectiveCamera } from 'three';
import type { ConstellationScene } from './constellationSceneAssembly';
import type { ConstellationModel } from './constellationTypes';

type DirectorDependencies = {
	camera: PerspectiveCamera;
	controls: OrbitControls;
	view: ConstellationScene;
	model: ConstellationModel;
	isAnimated: boolean;
};

/** Flies the camera to the whole brain, to one area or to one neuron, and dims everything else. */
export class FocusDirector {
	private readonly flight: CameraFlight;
	private model: ConstellationModel;
	private focusKey: string | null = null;

	constructor(private readonly dependencies: DirectorDependencies) {
		const { camera, controls, model } = dependencies;
		const { target } = controls;
		this.flight = createCameraFlight(camera, target);
		this.model = model;
		const home = homeViewpoint(model);
		camera.position.copy(home.position);
		target.copy(home.target);
	}

	focusContext = (contextSlug: string | null): void => {
		const { controls, isAnimated } = this.dependencies;
		this.applyFocus(contextSlug);
		controls.autoRotate = contextSlug === null && isAnimated;
		const viewpoint = this.viewpointOf(contextSlug);
		if (viewpoint !== null) this.travel(viewpoint);
	};

	focusNeuron = (slug: string): void => {
		const neuron = this.model.neurons.find((candidate) => candidate.slug === slug);
		if (neuron === undefined) return;
		const { controls } = this.dependencies;
		this.applyFocus(neuron.contextSlug ?? WHOLE_MODEL_KEY);
		controls.autoRotate = false;
		this.travel(neuronViewpoint(neuron, this.model));
	};

	refresh(model: ConstellationModel): void {
		this.model = model;
		this.applyFocus(this.focusKey);
	}

	update(deltaSeconds: number): void {
		const { camera, controls } = this.dependencies;
		this.flight.update(camera, controls.target, deltaSeconds);
	}

	private viewpointOf(contextSlug: string | null): Viewpoint | null {
		if (contextSlug === null) return homeViewpoint(this.model);
		const nucleus = this.model.nuclei.find((candidate) => candidate.slug === contextSlug);
		if (nucleus === undefined) return null;
		return contextViewpoint(nucleus);
	}

	private applyFocus(contextKey: string | null): void {
		this.focusKey = contextKey;
		this.dependencies.view.setFocus(contextKey);
	}

	private travel(viewpoint: Viewpoint): void {
		this.flight.flyTo(viewpoint.position, viewpoint.target);
	}
}
