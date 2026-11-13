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
	const grown: GrownBranch[] = [];
	for (const heading of branchHeadings(connectionDirections, proportions, nextShare)) {
		const reach = proportions.dendriteReach * trunkLengthShare(nextShare);
		const trunk = growBranch(
			{
				origin: heading.clone().multiplyScalar(somaRadius * ROOT_DEPTH_SHARE),
				heading,
				reach,
				reachAtOrigin: 0,
				rootRadius: somaRadius * proportions.dendriteRootRadiusShare,
				tipRadiusShare: TRUNK_TIP_RADIUS_SHARE,
				segmentShares: TRUNK_SEGMENT_SHARES,
				samplesPerControlPoint: TRUNK_SAMPLES_PER_CONTROL_POINT,
				wobbleSpread: TRUNK_WOBBLE
			},
			nextShare
		);
		grown.push(trunk);
		const twigRule = sproutRule(reach * TWIG_LENGTH_SHARE, TWIG_SEGMENT_SHARES, TWIG_SPREAD, twigChance);
		const twigletReach = reach * TWIG_LENGTH_SHARE * TWIGLET_LENGTH_SHARE;
		const twigletChance = TWIGLET_CHANCE * detailShare;
		const twigletRule = sproutRule(twigletReach, TWIGLET_SEGMENT_SHARES, TWIGLET_SPREAD, twigletChance);
		for (const twig of sproutsAlong(trunk, twigRule, nextShare)) {
			grown.push(twig, ...sproutsAlong(twig, twigletRule, nextShare));
		}
	}
	return normalisedByFarthestReach(grown);
}

function trunkLengthShare(nextShare: () => number): number {
	return SHORTEST_TRUNK_SHARE + (1 - SHORTEST_TRUNK_SHARE) * nextShare();
}

function sproutRule(
	reach: number,
	segmentShares: number[],
	spread: number,
	chance: number
): SproutRule {
	return {
		reach,
		segmentShares,
		spread,
		chance,
		rootRadiusShare: SPROUT_ROOT_RADIUS_SHARE,
		tipRadiusShare: SPROUT_TIP_RADIUS_SHARE,
		samplesPerControlPoint: SPROUT_SAMPLES_PER_CONTROL_POINT
	};
}

function normalisedByFarthestReach(branches: GrownBranch[]): FibrePath[] {
	const farthestReach = Math.max(...branches.flatMap((branch) => branch.reaches), SMALLEST_REACH);
	return branches.map((branch) => ({
		points: branch.points,
		radii: branch.radii,
		reachShares: branch.reaches.map((reach) => reach / farthestReach)
	}));
}
