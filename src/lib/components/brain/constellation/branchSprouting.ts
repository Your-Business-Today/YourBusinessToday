import { growBranch, JOINT_STRIDE, type GrownBranch } from './branchGrowth';
import { wobble } from './branchSeeds';

export type SproutRule = {
	reach: number;
	segmentShares: number[];
	spread: number;
	chance: number;
	rootRadiusShare: number;
	tipRadiusShare: number;
	samplesPerControlPoint: number;
};

export function sproutsAlong(
	parent: GrownBranch,
	rule: SproutRule,
	nextShare: () => number
): GrownBranch[] {
	const sprouts: GrownBranch[] = [];
	const lastJoint = parent.points.length - 2;
	for (let jointIndex = JOINT_STRIDE; jointIndex < lastJoint; jointIndex += JOINT_STRIDE) {
		if (nextShare() > rule.chance) continue;
		sprouts.push(sproutAt(parent, jointIndex, rule, nextShare));
	}
	return sprouts;
}

function sproutAt(
	parent: GrownBranch,
	jointIndex: number,
	rule: SproutRule,
	nextShare: () => number
): GrownBranch {
	const heading = parent.points[jointIndex + 1].clone().sub(parent.points[jointIndex]).normalize();
	wobble(heading, rule.spread, nextShare);
	return growBranch(
		{
			origin: parent.points[jointIndex],
			heading,
			reach: rule.reach,
			reachAtOrigin: parent.reaches[jointIndex],
			rootRadius: parent.radii[jointIndex] * rule.rootRadiusShare,
			tipRadiusShare: rule.tipRadiusShare,
			segmentShares: rule.segmentShares,
			samplesPerControlPoint: rule.samplesPerControlPoint,
			wobbleSpread: rule.spread / 2
		},
		nextShare
	);
}
