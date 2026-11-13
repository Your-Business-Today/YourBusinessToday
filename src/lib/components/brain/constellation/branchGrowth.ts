import { CatmullRomCurve3, Vector3 } from 'three';
import { wobble } from './branchSeeds';
import { distancesAlong } from './pathDistances';

export const JOINT_STRIDE = 3;
const TAPER_POWER = 1.5;
const CLOSING_CONE_SHARE = 1.5;
const COLLAR_SWELL = 0.8;
const COLLAR_LENGTH_SHARE = 2.2;

export type GrownBranch = { points: Vector3[]; radii: number[]; reaches: number[] };

export type BranchSeed = {
	origin: Vector3;
	heading: Vector3;
	reach: number;
	reachAtOrigin: number;
	rootRadius: number;
	tipRadiusShare: number;
	segmentShares: number[];
	samplesPerControlPoint: number;
	wobbleSpread: number;
};

export function growBranch(seed: BranchSeed, nextShare: () => number): GrownBranch {
	const controlPoints = [seed.origin.clone()];
	const walker = seed.heading.clone();
	for (const share of seed.segmentShares) {
		wobble(walker, seed.wobbleSpread, nextShare);
		const previous = controlPoints[controlPoints.length - 1];
		controlPoints.push(previous.clone().addScaledVector(walker, seed.reach * share));
	}
	const sampleCount = controlPoints.length * seed.samplesPerControlPoint;
	const points = new CatmullRomCurve3(controlPoints, false, 'centripetal').getPoints(sampleCount);
	const distances = distancesAlong(points);
	const length = distances[distances.length - 1];
	const radii = distances.map((distance) => taperedRadius(seed, distance, length));
	const reaches = distances.map((distance) => seed.reachAtOrigin + distance);
	return closedWithCone({ points, radii, reaches });
}

function taperedRadius(seed: BranchSeed, distance: number, length: number): number {
	const thinning = (1 - distance / length) ** TAPER_POWER;
	const thickness = seed.tipRadiusShare + (1 - seed.tipRadiusShare) * thinning;
	const collar = COLLAR_SWELL * Math.exp(-distance / (seed.rootRadius * COLLAR_LENGTH_SHARE));
	return seed.rootRadius * (thickness + collar);
}

function closedWithCone(branch: GrownBranch): GrownBranch {
	const lastIndex = branch.points.length - 1;
	const tip = branch.points[lastIndex];
	const heading = tip.clone().sub(branch.points[lastIndex - 1]).normalize();
	const coneLength = branch.radii[lastIndex] * CLOSING_CONE_SHARE;
	return {
		points: [...branch.points, tip.clone().addScaledVector(heading, coneLength)],
		radii: [...branch.radii, 0],
		reaches: [...branch.reaches, branch.reaches[lastIndex] + coneLength]
	};
}
