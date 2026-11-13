import type { Picker } from './constellationPicking';
import type { PointerHandlers } from './constellationPointer';
import type { ConstellationCallbacks } from './constellationTypes';

type InteractionDependencies = {
	canvas: HTMLCanvasElement;
	picker: Picker;
	callbacks: ConstellationCallbacks;
	focusContext: (contextSlug: string) => void;
	focusNeuron: (slug: string) => void;
};

const POINTING_AT_NOTHING = 'grab';
const POINTING_AT_A_CELL = 'pointer';

function showCursor(canvas: HTMLCanvasElement, cursor: string): void {
	const { style } = canvas;
	style.cursor = cursor;
}

export function constellationInteractions(dependencies: InteractionDependencies): PointerHandlers {
	const { canvas, picker, callbacks } = dependencies;

	function hover(pointerX: number, pointerY: number): void {
		const picked = picker.pick(pointerX, pointerY);
		showCursor(canvas, picked === null ? POINTING_AT_NOTHING : POINTING_AT_A_CELL);
		if (picked === null) {
			callbacks.onHover(null);
			return;
		}
		const bounds = canvas.getBoundingClientRect();
		callbacks.onHover({ ...picked, x: pointerX - bounds.left, y: pointerY - bounds.top });
	}

	function click(pointerX: number, pointerY: number): void {
		const picked = picker.pick(pointerX, pointerY);
		if (picked === null) return;
		callbacks.onHover(null);
		if (picked.nucleusSlug !== undefined) {
			dependencies.focusContext(picked.nucleusSlug);
			callbacks.onFocusContext(picked.nucleusSlug);
			return;
		}
		if (picked.neuronSlug === undefined) return;
		dependencies.focusNeuron(picked.neuronSlug);
		callbacks.onSelectNeuron(picked.neuronSlug);
	}

	return { onMove: hover, onClick: click, onLeave: () => callbacks.onHover(null) };
}
