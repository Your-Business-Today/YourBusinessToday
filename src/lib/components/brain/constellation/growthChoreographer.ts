import { clampShare } from './growthShares';
import type { NeuronBody } from './neuronBody';
import type { SettleFlashes } from './settleFlash';
import type { SynapseStrand } from './synapseStrand';

const SPROUT_SECONDS = 1.1;
const PREFERRED_STAGGER_SECONDS = 0.45;
const LONGEST_CASCADE_SECONDS = 8;
const STRAND_PHASE_START = 0.55;

type Sprout = {
	body: NeuronBody;
	strands: SynapseStrand[];
	startSeconds: number;
	hasSettled: boolean;
};

export type GrowthChoreographer = {
	plan: (slugs: string[]) => void;
	update: (deltaSeconds: number) => void;
};

export type GrowthDependencies = {
	bodyFor: (slug: string) => NeuronBody | undefined;
	strandsTouching: (slug: string) => SynapseStrand[];
	flashes: SettleFlashes;
	isAnimated: boolean;
};

export function createGrowthChoreographer(dependencies: GrowthDependencies): GrowthChoreographer {
	const { bodyFor, strandsTouching, flashes, isAnimated } = dependencies;
	let sprouts: Sprout[] = [];
	let clockSeconds = 0;

	function plan(slugs: string[]): void {
		if (!isAnimated || slugs.length === 0) return;
		clockSeconds = 0;
		const claimedStrands = new Set<SynapseStrand>();
		const stagger = Math.min(PREFERRED_STAGGER_SECONDS, LONGEST_CASCADE_SECONDS / slugs.length);
		sprouts = slugs.flatMap((slug, index) => planted(slug, index * stagger, claimedStrands));
	}

	function planted(
		slug: string,
		startSeconds: number,
		claimedStrands: Set<SynapseStrand>
	): Sprout[] {
		const body = bodyFor(slug);
		if (body === undefined) return [];
		const strands = strandsTouching(slug).filter((strand) => !claimedStrands.has(strand));
		for (const strand of strands) {
			claimedStrands.add(strand);
			strand.orientFrom(slug);
			strand.setGrowth(0);
		}
		body.setGrowth(0);
		return [{ body, strands, startSeconds, hasSettled: false }];
	}

	function update(deltaSeconds: number): void {
		if (sprouts.length === 0) return;
		clockSeconds += deltaSeconds;
		for (const sprout of sprouts) advance(sprout);
		sprouts = sprouts.filter((sprout) => !sprout.hasSettled);
	}

	function advance(sprout: Sprout): void {
		const share = clampShare((clockSeconds - sprout.startSeconds) / SPROUT_SECONDS);
		sprout.body.setGrowth(share);
		const strandShare = clampShare((share - STRAND_PHASE_START) / (1 - STRAND_PHASE_START));
		for (const strand of sprout.strands) strand.setGrowth(strandShare);
		if (share < 1) return;
		flashes.spawn(sprout.body.position, sprout.body.colour);
		sprout.hasSettled = true;
	}

	return { plan, update };
}
