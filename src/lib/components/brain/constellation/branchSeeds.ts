import { Vector3 } from 'three';
import { clampShare } from './growthShares';
import type { BodyProportions } from './neuronProportions';

const CONNECTION_CLEARANCE_COSINE = 0.8;
const CLEARANCE_ATTEMPT_LIMIT = 8;
const FULL_TURN_RADIANS = Math.PI * 2;

export function richnessOf(connectionDirections: Vector3[], proportions: BodyProportions): number {
	return clampShare(connectionDirections.length / proportions.branchCountCeiling);
}

export function branchHeadings(
	connectionDirections: Vector3[],
	proportions: BodyProportions,
	nextShare: () => number
): Vector3[] {
	const { branchCountFloor, branchCountCeiling } = proportions;
	const richness = richnessOf(connectionDirections, proportions);
	const headingCount = Math.round(
		branchCountFloor + (branchCountCeiling - branchCountFloor) * richness
	);
	const headings: Vector3[] = [];
	while (headings.length < headingCount) {
		headings.push(clearOfConnections(connectionDirections, nextShare));
	}
	return headings;
}

export function randomDirection(nextShare: () => number): Vector3 {
	const altitude = nextShare() * 2 - 1;
	const azimuth = nextShare() * FULL_TURN_RADIANS;
	const ringRadius = Math.sqrt(Math.max(0, 1 - altitude * altitude));
	return new Vector3(Math.cos(azimuth) * ringRadius, altitude, Math.sin(azimuth) * ringRadius);
}

export function wobble(heading: Vector3, spread: number, nextShare: () => number): void {
	heading.addScaledVector(randomDirection(nextShare), spread).normalize();
}

function clearOfConnections(connectionDirections: Vector3[], nextShare: () => number): Vector3 {
	let heading = randomDirection(nextShare);
	for (let attempt = 0; attempt < CLEARANCE_ATTEMPT_LIMIT; attempt += 1) {
		const isClear = connectionDirections.every(
			(direction) => direction.dot(heading) < CONNECTION_CLEARANCE_COSINE
		);
		if (isClear) return heading;
		heading = randomDirection(nextShare);
	}
	return heading;
}
