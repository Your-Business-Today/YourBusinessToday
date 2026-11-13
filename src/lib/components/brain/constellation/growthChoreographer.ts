import { clampShare } from './growthShares';
import type { NeuronBody } from './neuronBody';
import type { SettleFlashes } from './settleFlash';
import type { SynapseStrand } from './synapseStrand';

const SPROUT_SECONDS = 1.1;
const PREFERRED_STAGGER_SECONDS = 0.45;
const LONGEST_CASCADE_SECONDS = 8;
const STRAND_PHASE_START = 0.55;
const UNGROWN = 0;
const FULLY_GROWN = 1;

export type GrowthDependencies = {
	bodyFor: (slug: string) => NeuronBody | undefined;
	strandsTouching: (slug: string) => SynapseStrand[];
	flashes: SettleFlashes;
	isAnimated: boolean;
};

/** One neuron growing into the brain with the synapses it brings, from the moment its turn comes. */
class Sprout {
	constructor(
		private readonly body: NeuronBody,
		private readonly strands: SynapseStrand[],
		private readonly startSeconds: number
	) {
		body.setGrowth(UNGROWN);
	}

	/** Grows the neuron as far as the clock has come, and answers whether it has settled. */
	growTo(clockSeconds: number, flashes: SettleFlashes): boolean {
		const share = clampShare((clockSeconds - this.startSeconds) / SPROUT_SECONDS);
		this.body.setGrowth(share);
		const strandShare = clampShare((share - STRAND_PHASE_START) / (FULLY_GROWN - STRAND_PHASE_START));
		for (const strand of this.strands) strand.setGrowth(strandShare);
		const hasSettled = share >= FULLY_GROWN;
		if (hasSettled) this.flashOn(flashes);
		return hasSettled;
	}

	private flashOn(flashes: SettleFlashes): void {
		const { position, colour } = this.body;
		flashes.spawn(position, colour);
	}
}

/** Grows new neurons into the brain one after another, so a brain that has learned something shows it arriving. */
export class GrowthChoreographer {
	private sprouts: Sprout[] = [];
	private clockSeconds = 0;

	constructor(private readonly dependencies: GrowthDependencies) {}

	plan(slugs: string[]): void {
		if (!this.dependencies.isAnimated || slugs.length === 0) return;
		this.clockSeconds = 0;
		const claimedStrands = new Set<SynapseStrand>();
		const stagger = Math.min(PREFERRED_STAGGER_SECONDS, LONGEST_CASCADE_SECONDS / slugs.length);
		this.sprouts = slugs.flatMap((slug, index) => this.planted(slug, index * stagger, claimedStrands));
	}

	update(deltaSeconds: number): void {
		if (this.sprouts.length === 0) return;
		this.clockSeconds += deltaSeconds;
		const { flashes } = this.dependencies;
		this.sprouts = this.sprouts.filter((sprout) => !sprout.growTo(this.clockSeconds, flashes));
	}

	private planted(slug: string, startSeconds: number, claimedStrands: Set<SynapseStrand>): Sprout[] {
		const { bodyFor, strandsTouching } = this.dependencies;
		const body = bodyFor(slug);
		if (body === undefined) return [];
		const strands = strandsTouching(slug).filter((strand) => !claimedStrands.has(strand));
		for (const strand of strands) {
			claimedStrands.add(strand);
			strand.orientFrom(slug);
			strand.setGrowth(UNGROWN);
		}
		return [new Sprout(body, strands, startSeconds)];
	}
}
