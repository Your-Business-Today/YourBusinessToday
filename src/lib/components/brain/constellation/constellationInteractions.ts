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

export function constellationInteractions(dependencies: InteractionDependencies): PointerHandlers {
	const { canvas, picker, callbacks } = dependencies;

	function hover(pointerX: number, pointerY: number): void {
		const picked = picker.pick(pointerX, pointerY);
		canvas.style.cursor = picked === null ? 'grab' : 'pointer';
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
