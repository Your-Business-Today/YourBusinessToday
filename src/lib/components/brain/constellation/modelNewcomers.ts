import type { ConstellationModel } from './constellationTypes';

export function bodySlugsOf(model: ConstellationModel): string[] {
	return [
		...model.nuclei.map((nucleus) => nucleus.slug),
		...model.neurons.map((neuron) => neuron.slug)
	];
}

export function newcomerSlugs(
	previous: ConstellationModel,
	next: ConstellationModel
): string[] {
	const known = new Set(bodySlugsOf(previous));
	return bodySlugsOf(next).filter((slug) => !known.has(slug));
}
