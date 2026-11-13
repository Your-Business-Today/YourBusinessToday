import { HALO, SIGNAL, kindColourOf } from './constellationPalette';
import type { ConstellationModel, Nucleus } from './constellationTypes';

export function nucleusColourOf(nucleus: Nucleus): number {
	return nucleus.isCoreDomain ? SIGNAL : HALO;
}

export function bodyColoursOf(model: ConstellationModel): Map<string, number> {
	const colours = new Map<string, number>();
	for (const neuron of model.neurons) colours.set(neuron.slug, kindColourOf(neuron.kind));
	for (const nucleus of model.nuclei) colours.set(nucleus.slug, nucleusColourOf(nucleus));
	return colours;
}
