import { Group, type Vector3 } from 'three';
import { bodyColoursOf } from './bodyColours';
import { somaRadiusOf } from './cellSoma';
import { createSynapseStrand, type SynapseStrand } from './synapseStrand';
import { CROSSLINK, DENDRITE } from './constellationPalette';
import { WHOLE_MODEL_KEY } from './materialBank';
import { neuronProportions, nucleusProportions } from './neuronProportions';
import type { CellMaterialBank } from './cellMaterialBank';
import type { ConstellationModel, Synapse, SynapseKind } from './constellationTypes';

const FIBRE_RADIUS_BY_KIND: Record<SynapseKind, number> = { dendrite: 0.003, crosslink: 0.0022 };

export type SampledCurve = {
	points: Vector3[];
	contextKey: string;
	colour: number;
	arrivesAt: string;
};

export type SynapseWeb = {
	group: Group;
	curves: SampledCurve[];
	strandsTouching: (slug: string) => SynapseStrand[];
	dispose: () => void;
};

export function createSynapseWeb(model: ConstellationModel, cells: CellMaterialBank): SynapseWeb {
	const nucleusSlugs = new Set(model.nuclei.map((nucleus) => nucleus.slug));
	const colours = bodyColoursOf(model);
	const somaRadiusFor = (slug: string) =>
		somaRadiusOf(slug, nucleusSlugs.has(slug) ? nucleusProportions : neuronProportions);

	function strandOf(synapse: Synapse): SynapseStrand {
		const contextKey = synapse.contextSlug ?? WHOLE_MODEL_KEY;
		const tints = {
			root: colours.get(synapse.fromSlug) ?? DENDRITE,
			span: contextKey === WHOLE_MODEL_KEY ? CROSSLINK : DENDRITE,
			tip: colours.get(synapse.toSlug) ?? DENDRITE
		};
		const material = cells.axonFor(`${synapse.fromSlug}->${synapse.toSlug}`, tints, contextKey);
		return createSynapseStrand(synapse, contextKey, material, {
			fromSomaRadius: somaRadiusFor(synapse.fromSlug),
			toSomaRadius: somaRadiusFor(synapse.toSlug),
			fibreRadius: FIBRE_RADIUS_BY_KIND[synapse.kind]
		});
	}

	const group = new Group();
	const strands = model.synapses.map(strandOf);
	for (const strand of strands) group.add(strand.mesh);

	function strandsTouching(slug: string): SynapseStrand[] {
		return strands.filter((strand) => strand.touches(slug));
	}

	function dispose(): void {
		for (const strand of strands) strand.dispose();
	}

	return {
		group,
		curves: model.synapses.map((synapse, index) => ({
			points: strands[index].pulsePoints,
			contextKey: strands[index].contextKey,
			colour: colours.get(synapse.fromSlug) ?? DENDRITE,
			arrivesAt: synapse.toSlug
		})),
		strandsTouching,
		dispose
	};
}
