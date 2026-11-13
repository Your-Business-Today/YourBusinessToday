import { Raycaster, Vector2, type Mesh, type PerspectiveCamera } from 'three';

export type PickResult = { neuronSlug?: string; nucleusSlug?: string };

export type Picker = {
	pick: (pointerX: number, pointerY: number) => PickResult | null;
};

export function createPicker(
	camera: PerspectiveCamera,
	canvas: HTMLCanvasElement,
	hitTargetsFor: () => Mesh[]
): Picker {
	const raycaster = new Raycaster();
	const pointer = new Vector2();

	function pick(pointerX: number, pointerY: number): PickResult | null {
		const bounds = canvas.getBoundingClientRect();
		pointer.x = ((pointerX - bounds.left) / bounds.width) * 2 - 1;
		pointer.y = -(((pointerY - bounds.top) / bounds.height) * 2 - 1);
		raycaster.setFromCamera(pointer, camera);
		const [nearest] = raycaster.intersectObjects(hitTargetsFor(), false);
		if (nearest === undefined) return null;
		return nearest.object.userData as PickResult;
	}

	return { pick };
}
