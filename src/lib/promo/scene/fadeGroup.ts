import type { Material } from 'three';

type FadingMaterial = { material: Material; fullOpacity: number };

export type FadeGroup = {
	add: <M extends Material>(material: M) => M;
	setPresence: (presence: number) => void;
};

/** Materials that fade in and out together, each back to the opacity it was made with. */
export function createFadeGroup(): FadeGroup {
	const members: FadingMaterial[] = [];
	const add = <M extends Material>(material: M): M => {
		material.transparent = true;
		members.push({ material, fullOpacity: material.opacity });
		return material;
	};
	const setPresence = (presence: number) => {
		const isPresent = presence > 0;
		members.forEach(({ material, fullOpacity }) => {
			material.opacity = fullOpacity * presence;
			material.visible = isPresent;
		});
	};
	return { add, setPresence };
}
