import { QuadraticBezierCurve3, Vector3 } from 'three';
import { randomBetween, seededRandom, type RandomSource } from '../promoRandom';

export type NetworkNode = { place: Vector3; arc: QuadraticBezierCurve3; reach: number; colourIndex: number };

const nodeCount = 56;
const networkSeed = 11;
const lineColourCount = 4;
const spread = { innerRadius: 20, outerRadius: 64, height: 18, flattening: 0.65, arcLift: 0.35 };

/** How far out the farthest node sits, so each node can be lit in turn as the wave reaches it. */
export const networkReach = spread.outerRadius;

function nodePlace(random: RandomSource): Vector3 {
	const angle = randomBetween(random, 0, Math.PI * 2);
	const reach = randomBetween(random, spread.innerRadius, spread.outerRadius);
	const height = randomBetween(random, -spread.height, spread.height);
	return new Vector3(Math.cos(angle) * reach, height, Math.sin(angle) * reach * spread.flattening);
}

function arcTo(place: Vector3): QuadraticBezierCurve3 {
	const centre = new Vector3();
	const lift = place.length() * spread.arcLift;
	const control = place.clone().multiplyScalar(1 / 2);
	control.setY(control.y + lift);
	return new QuadraticBezierCurve3(centre, control, place);
}

function createNodes(): NetworkNode[] {
	const random = seededRandom(networkSeed);
	return Array.from({ length: nodeCount }, (_, index) => {
		const place = nodePlace(random);
		return { place, arc: arcTo(place), reach: place.length(), colourIndex: index % lineColourCount };
	});
}

/** Everyone the app reaches once it is live: the team's offices, sites and phones, scattered round the portal. */
export const networkNodes = createNodes();
