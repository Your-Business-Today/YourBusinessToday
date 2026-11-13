import { createSceneLoop } from '../../stage/animationLoop';
import { createStage, fitStageTo } from '../../stage/createStage';
import { ConstellationScene } from './constellationSceneAssembly';
import { attachExperienceInput } from './experienceInput';
import { FocusDirector } from './focusDirector';
import { GrowthChoreographer } from './growthChoreographer';
import { bodySlugsOf, newcomerSlugs } from './modelNewcomers';
import { createOrbitRig, prefersReducedMotion } from './orbitRig';
import type { ConstellationCallbacks, ConstellationModel } from './constellationTypes';

const FIELD_OF_VIEW_DEGREES = 50;
const FAR_PLANE = 220;

export type ExperienceOptions = { shouldCascadeInitialModel?: boolean; onReady?: () => void };

export type ConstellationExperience = {
	updateModel: (model: ConstellationModel) => void;
	focusContext: (contextSlug: string | null) => void;
	focusNeuron: (slug: string) => void;
	resetView: () => void;
	pause: () => void;
	resume: () => void;
	destroy: () => void;
};

export function createConstellationExperience(
	canvas: HTMLCanvasElement,
	container: HTMLElement,
	model: ConstellationModel,
	callbacks: ConstellationCallbacks,
	options: ExperienceOptions = {}
): ConstellationExperience {
	const isAnimated = !prefersReducedMotion();
	const stage = createStage(canvas, { fieldOfViewDegrees: FIELD_OF_VIEW_DEGREES, farPlane: FAR_PLANE });
	const { camera, renderer } = stage;
	const view = new ConstellationScene(model);
	const controls = createOrbitRig(camera, canvas);
	const director = new FocusDirector({ camera, controls, view, model, isAnimated });
	const growth = growthFor(view, isAnimated, options.shouldCascadeInitialModel === true ? bodySlugsOf(model) : []);
	const detachPointer = attachExperienceInput({ canvas, camera, hitTargetsFor: () => view.hitTargets(), callbacks, director });
	const resizeObserver = fitStageTo(stage, container);
	let knownModel = model;

	function frame(deltaSeconds: number, timeSeconds: number): void {
		director.update(deltaSeconds);
		controls.update();
		growth.update(deltaSeconds);
		view.advance(deltaSeconds, timeSeconds, isAnimated, canvas.height);
		renderer.render(view.scene, camera);
	}

	const loop = createSceneLoop(frame, options.onReady);

	function updateModel(updatedModel: ConstellationModel): void {
		if (updatedModel === knownModel) return;
		const newcomers = newcomerSlugs(knownModel, updatedModel);
		knownModel = updatedModel;
		view.rebuild(updatedModel);
		view.showPulses(isAnimated);
		director.refresh(updatedModel);
		growth.plan(newcomers);
	}

	function destroy(): void {
		loop.pause();
		detachPointer();
		resizeObserver.disconnect();
		controls.dispose();
		view.dispose();
		stage.dispose();
	}

	return {
		updateModel,
		focusContext: director.focusContext,
		focusNeuron: director.focusNeuron,
		resetView: () => director.focusContext(null),
		pause: loop.pause,
		resume: loop.resume,
		destroy
	};
}

function growthFor(view: ConstellationScene, isAnimated: boolean, cascadingSlugs: string[]): GrowthChoreographer {
	const { flashes } = view;
	const growth = new GrowthChoreographer({
		bodyFor: (slug) => view.bodyFor(slug),
		strandsTouching: (slug) => view.strandsTouching(slug),
		flashes,
		isAnimated
	});
	view.showPulses(isAnimated);
	growth.plan(cascadingSlugs);
	return growth;
}
