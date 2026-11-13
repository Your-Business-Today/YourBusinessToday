import { Group, Vector3, type Sprite, type SpriteMaterial } from 'three';
import { createTextSprite } from './textSprite';
import { asCssColour, SIGNAL, SILVER } from './constellationPalette';
import type { Nucleus } from './constellationTypes';

const LABEL_LIFT = 0.85;

export function createNucleusLabels(nuclei: Nucleus[]): Group {
	const labels = new Group();
	for (const nucleus of nuclei) {
		const colour = nucleus.isCoreDomain ? asCssColour(SIGNAL) : asCssColour(SILVER);
		const label = createTextSprite(nucleus.name.toUpperCase(), colour);
		label.position.copy(nucleus.position).add(new Vector3(0, nucleus.clusterRadius + LABEL_LIFT, 0));
		labels.add(label);
	}
	return labels;
}

export function disposeNucleusLabels(labels: Group): void {
	for (const label of labels.children as Sprite[]) {
		const material = label.material as SpriteMaterial;
		material.map?.dispose();
		material.dispose();
	}
}
