import { constellationInteractions } from './constellationInteractions';
import { createPicker } from './constellationPicking';
import { attachConstellationPointer } from './constellationPointer';
import type { Mesh, PerspectiveCamera } from 'three';
import type { FocusDirector } from './focusDirector';
import type { ConstellationCallbacks } from './constellationTypes';

export function attachExperienceInput(dependencies: {
	canvas: HTMLCanvasElement;
	camera: PerspectiveCamera;
	hitTargetsFor: () => Mesh[];
	callbacks: ConstellationCallbacks;
	director: FocusDirector;
}): () => void {
	const { canvas, camera, hitTargetsFor, callbacks, director } = dependencies;
	const picker = createPicker(camera, canvas, hitTargetsFor);
	return attachConstellationPointer(
		canvas,
		constellationInteractions({
			canvas,
			picker,
			callbacks,
			focusContext: director.focusContext,
			focusNeuron: director.focusNeuron
		})
	);
}
