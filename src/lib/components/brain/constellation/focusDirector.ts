import { createCameraFlight } from './cameraFlight';
import {
	contextViewpoint,
	homeViewpoint,
	neuronViewpoint,
	type Viewpoint
} from './focusChoreography';
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

export type FocusDirector = {
	focusContext: (contextSlug: string | null) => void;
	focusNeuron: (slug: string) => void;
	refresh: (model: ConstellationModel) => void;
	update: (deltaSeconds: number) => void;
};

export function createFocusDirector(dependencies: DirectorDependencies): FocusDirector {
	const { camera, controls, view, isAnimated } = dependencies;
	const flight = createCameraFlight(camera, controls.target);
	let model = dependencies.model;
	let focusKey: string | null = null;

	const home = homeViewpoint(model);
	camera.position.copy(home.position);
	controls.target.copy(home.target);

	function applyFocus(contextKey: string | null): void {
		focusKey = contextKey;
		view.bank.setFocus(contextKey);
		view.cells.setFocus(contextKey);
		view.mounted.pulses.setFocus(contextKey);
		view.ambient.setFocus(contextKey);
	}

	function travel(viewpoint: Viewpoint): void {
		flight.flyTo(viewpoint.position, viewpoint.target);
	}

	function focusContext(contextSlug: string | null): void {
		applyFocus(contextSlug);
		controls.autoRotate = contextSlug === null && isAnimated;
		if (contextSlug === null) return travel(homeViewpoint(model));
		const nucleus = model.nuclei.find((candidate) => candidate.slug === contextSlug);
		if (nucleus !== undefined) travel(contextViewpoint(nucleus));
	}

	function focusNeuron(slug: string): void {
		const neuron = model.neurons.find((candidate) => candidate.slug === slug);
		if (neuron === undefined) return;
		applyFocus(neuron.contextSlug ?? WHOLE_MODEL_KEY);
		controls.autoRotate = false;
		travel(neuronViewpoint(neuron, model));
	}

	function refresh(refreshedModel: ConstellationModel): void {
		model = refreshedModel;
		applyFocus(focusKey);
	}

	function update(deltaSeconds: number): void {
		flight.update(camera, controls.target, deltaSeconds);
	}

	return { focusContext, focusNeuron, refresh, update };
}
