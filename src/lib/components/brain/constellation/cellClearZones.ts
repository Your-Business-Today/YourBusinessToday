import { somaRadiusOf } from './cellSoma';
import { neuronProportions, nucleusProportions } from './neuronProportions';
import type { ClearZone } from './ambientLinks';
import type { ConstellationModel } from './constellationTypes';

const CLEARANCE_SHARE = 3;

export function cellZonesOf(model: ConstellationModel): ClearZone[] {
	return [
		...model.neurons.map((neuron) => ({
			centre: neuron.position,
			radius: somaRadiusOf(neuron.slug, neuronProportions) * CLEARANCE_SHARE
		})),
		...model.nuclei.map((nucleus) => ({
			centre: nucleus.position,
			radius: somaRadiusOf(nucleus.slug, nucleusProportions) * CLEARANCE_SHARE
		}))
	];
}
