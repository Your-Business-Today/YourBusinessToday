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

/** Every synapse of the brain drawn as a strand between two cells, and the curves its pulses travel. */
export class SynapseWeb {
	readonly group = new Group();
	readonly curves: SampledCurve[];
	private readonly strands: SynapseStrand[];
	private readonly nucleusSlugs: Set<string>;
	private readonly colours: Map<string, number>;

	constructor(
		model: ConstellationModel,
		private readonly cells: CellMaterialBank
	) {
		const { nuclei, synapses } = model;
		this.nucleusSlugs = new Set(nuclei.map((nucleus) => nucleus.slug));
		this.colours = bodyColoursOf(model);
		this.strands = synapses.map((synapse) => this.strandOf(synapse));
		for (const strand of this.strands) this.group.add(strand.mesh);
		this.curves = synapses.map((synapse, index) => this.curveOf(synapse, this.strands[index]));
	}

	strandsTouching(slug: string): SynapseStrand[] {
		return this.strands.filter((strand) => strand.touches(slug));
	}

	dispose(): void {
		for (const strand of this.strands) strand.dispose();
	}

	private strandOf(synapse: Synapse): SynapseStrand {
		const { fromSlug, toSlug, kind } = synapse;
		const contextKey = synapse.contextSlug ?? WHOLE_MODEL_KEY;
		const span = contextKey === WHOLE_MODEL_KEY ? CROSSLINK : DENDRITE;
		const tints = { root: this.colourOf(fromSlug), span, tip: this.colourOf(toSlug) };
		const material = this.cells.axonFor(`${fromSlug}->${toSlug}`, tints, contextKey);
		return createSynapseStrand(synapse, contextKey, material, {
			fromSomaRadius: this.somaRadiusFor(fromSlug),
			toSomaRadius: this.somaRadiusFor(toSlug),
			fibreRadius: FIBRE_RADIUS_BY_KIND[kind]
		});
	}

	private curveOf(synapse: Synapse, strand: SynapseStrand): SampledCurve {
		const { pulsePoints, contextKey } = strand;
		return { points: pulsePoints, contextKey, colour: this.colourOf(synapse.fromSlug), arrivesAt: synapse.toSlug };
	}

	private colourOf(slug: string): number {
		return this.colours.get(slug) ?? DENDRITE;
	}

	private somaRadiusFor(slug: string): number {
		return somaRadiusOf(slug, this.nucleusSlugs.has(slug) ? nucleusProportions : neuronProportions);
	}
}
