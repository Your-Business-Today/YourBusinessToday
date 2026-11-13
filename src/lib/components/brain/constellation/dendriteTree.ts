import type { Vector3 } from 'three';
import { growBranch, type GrownBranch } from './branchGrowth';
import { sproutsAlong, type SproutRule } from './branchSprouting';
import { branchHeadings, richnessOf } from './branchSeeds';
import { somaRadiusOf } from './cellSoma';
import type { FibrePath } from './fibreGeometry';
import type { BodyProportions } from './neuronProportions';

const TRUNK_SEGMENT_SHARES = [0.3, 0.25, 0.2, 0.15, 0.1];
const TWIG_SEGMENT_SHARES = [0.45, 0.3, 0.25];
const TWIGLET_SEGMENT_SHARES = [0.6, 0.4];
const TWIG_LENGTH_SHARE = 0.5;
const TWIGLET_LENGTH_SHARE = 0.45;
const SHORTEST_TRUNK_SHARE = 0.7;
const SPARSEST_TWIG_CHANCE = 0.3;
const TWIG_CHANCE_SPREAD = 0.4;
const TWIGLET_CHANCE = 0.3;
const TRUNK_SAMPLES_PER_CONTROL_POINT = 3;
const SPROUT_SAMPLES_PER_CONTROL_POINT = 2;
const TRUNK_WOBBLE = 0.3;
const TWIG_SPREAD = 0.85;
const TWIGLET_SPREAD = 0.7;
const ROOT_DEPTH_SHARE = 0.7;
const TRUNK_TIP_RADIUS_SHARE = 0.18;
const SPROUT_ROOT_RADIUS_SHARE = 0.55;
const SPROUT_TIP_RADIUS_SHARE = 0.3;
const SMALLEST_REACH = 0.000001;

type TreeGrowth = { somaRadius: number; proportions: BodyProportions; twigChance: number; detailShare: number; nextShare: () => number };

export function growDendriteTree(
	slug: string,
	connectionDirections: Vector3[],
	proportions: BodyProportions,
	detailShare: number,
	nextShare: () => number
): FibrePath[] {
	const somaRadius = somaRadiusOf(slug, proportions);
	const richness = richnessOf(connectionDirections, proportions);
	const twigChance = (SPARSEST_TWIG_CHANCE + TWIG_CHANCE_SPREAD * richness) * detailShare;
	const growth = { somaRadius, proportions, twigChance, detailShare, nextShare };
	const headings = branchHeadings(connectionDirections, proportions, nextShare);
	return normalisedByFarthestReach(headings.flatMap((heading) => limbOf(heading, growth)));
}

function limbOf(heading: Vector3, growth: TreeGrowth): GrownBranch[] {
	const { proportions, twigChance, detailShare, nextShare } = growth;
	const reach = proportions.dendriteReach * trunkLengthShare(nextShare);
	const trunk = trunkOf(heading, reach, growth);
	const twigRule = sproutRule(reach * TWIG_LENGTH_SHARE, TWIG_SEGMENT_SHARES, TWIG_SPREAD, twigChance);
	const twigletReach = reach * TWIG_LENGTH_SHARE * TWIGLET_LENGTH_SHARE;
	const twigletRule = sproutRule(twigletReach, TWIGLET_SEGMENT_SHARES, TWIGLET_SPREAD, TWIGLET_CHANCE * detailShare);
	const twigs = sproutsAlong(trunk, twigRule, nextShare);
	return [trunk, ...twigs.flatMap((twig) => [twig, ...sproutsAlong(twig, twigletRule, nextShare)])];
}

function trunkOf(heading: Vector3, reach: number, growth: TreeGrowth): GrownBranch {
	const { somaRadius, proportions, nextShare } = growth;
	const trunk = {
		origin: heading.clone().multiplyScalar(somaRadius * ROOT_DEPTH_SHARE),
		heading,
		reach,
		reachAtOrigin: 0,
		rootRadius: somaRadius * proportions.dendriteRootRadiusShare,
		tipRadiusShare: TRUNK_TIP_RADIUS_SHARE,
		segmentShares: TRUNK_SEGMENT_SHARES,
		samplesPerControlPoint: TRUNK_SAMPLES_PER_CONTROL_POINT,
		wobbleSpread: TRUNK_WOBBLE
	};
	return growBranch(trunk, nextShare);
}

function trunkLengthShare(nextShare: () => number): number {
	return SHORTEST_TRUNK_SHARE + (1 - SHORTEST_TRUNK_SHARE) * nextShare();
}

function sproutRule(reach: number, segmentShares: number[], spread: number, chance: number): SproutRule {
	const radii = { rootRadiusShare: SPROUT_ROOT_RADIUS_SHARE, tipRadiusShare: SPROUT_TIP_RADIUS_SHARE };
	return { reach, segmentShares, spread, chance, ...radii, samplesPerControlPoint: SPROUT_SAMPLES_PER_CONTROL_POINT };
}

function normalisedByFarthestReach(branches: GrownBranch[]): FibrePath[] {
	const farthestReach = Math.max(...branches.flatMap((branch) => branch.reaches), SMALLEST_REACH);
	return branches.map((branch) => ({
		points: branch.points,
		radii: branch.radii,
		reachShares: branch.reaches.map((reach) => reach / farthestReach)
	}));
}
