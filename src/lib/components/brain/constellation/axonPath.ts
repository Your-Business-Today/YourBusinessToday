import { CubicBezierCurve3, Vector3 } from 'three';
import { perpendicularTo } from './fibreFrames';
import { distancesAlong } from './pathDistances';
import { shareStreamFrom } from './pseudoRandom';
import type { FibrePath } from './fibreGeometry';
import type { StrandHeadings } from './synapseHeadings';
import type { Synapse } from './constellationTypes';

const RING_COUNT = 40;
const HANDLE_SHARE = 0.32;
const CROSSLINK_OUTWARD_LIFT = 0.09;
const ROOT_DEPTH_SHARE = 0.6;
const HILLOCK_RADIUS_SHARE = 0.2;
const HILLOCK_LENGTH_SHARE = 0.9;
const ARRIVAL_RADIUS_SHARE = 0.14;
const ARRIVAL_LENGTH_SHARE = 0.7;
const MEANDER_SHARE = 0.03;
const FULL_TURN_RADIANS = Math.PI * 2;

export type AxonEnds = { fromSomaRadius: number; toSomaRadius: number; fibreRadius: number };

export function axonPathOf(synapse: Synapse, headings: StrandHeadings, ends: AxonEnds): FibrePath {
	const nextShare = shareStreamFrom(`${synapse.fromSlug}~${synapse.toSlug}`);
	const start = synapse.from.clone().addScaledVector(headings.leaving, ends.fromSomaRadius * ROOT_DEPTH_SHARE);
	const end = synapse.to.clone().addScaledVector(headings.arriving, ends.toSomaRadius * ROOT_DEPTH_SHARE);
	const span = start.distanceTo(end);
	const outwardLift = synapse.kind === 'crosslink' ? span * CROSSLINK_OUTWARD_LIFT : 0;
	const curve = new CubicBezierCurve3(
		start,
		handleFrom(start, headings.leaving, span, outwardLift),
		handleFrom(end, headings.arriving, span, outwardLift),
		end
	);
	const meander = meanderAcross(start, end, span, nextShare);
	const points = Array.from({ length: RING_COUNT + 1 }, (_, index) => {
		const share = index / RING_COUNT;
		return curve.getPoint(denseAtEnds(share)).add(meander(share));
	});
	const distances = distancesAlong(points);
	const length = distances[RING_COUNT];
	return {
		points,
		radii: distances.map((distance) => axonRadius(distance, length - distance, ends)),
		reachShares: distances.map((distance) => distance / length)
	};
}

function handleFrom(anchor: Vector3, heading: Vector3, span: number, outwardLift: number): Vector3 {
	const handle = anchor.clone().addScaledVector(heading, span * HANDLE_SHARE);
	if (outwardLift === 0) return handle;
	return handle.addScaledVector(handle.clone().normalize(), outwardLift);
}

function denseAtEnds(share: number): number {
	return share - Math.sin(FULL_TURN_RADIANS * share) / FULL_TURN_RADIANS;
}

function meanderAcross(
	start: Vector3,
	end: Vector3,
	span: number,
	nextShare: () => number
): (share: number) => Vector3 {
	const chord = end.clone().sub(start).normalize();
	const across = perpendicularTo(chord);
	const up = chord.clone().cross(across);
	const amplitude = span * MEANDER_SHARE;
	const acrossTurns = 1 + nextShare();
	const upTurns = 1 + nextShare();
	const acrossPhase = nextShare() * FULL_TURN_RADIANS;
	const upPhase = nextShare() * FULL_TURN_RADIANS;
	return (share) => {
		const envelope = Math.sin(Math.PI * share) * amplitude;
		const acrossSwing = Math.sin(FULL_TURN_RADIANS * acrossTurns * share + acrossPhase) * envelope;
		const upSwing = Math.sin(FULL_TURN_RADIANS * upTurns * share + upPhase) * envelope;
		return across.clone().multiplyScalar(acrossSwing).addScaledVector(up, upSwing);
	};
}

function axonRadius(distanceFromStart: number, distanceToEnd: number, ends: AxonEnds): number {
	const hillockSwell = ends.fromSomaRadius * HILLOCK_RADIUS_SHARE - ends.fibreRadius;
	const hillock = hillockSwell * Math.exp(-distanceFromStart / (ends.fromSomaRadius * HILLOCK_LENGTH_SHARE));
	const arrivalSwell = ends.toSomaRadius * ARRIVAL_RADIUS_SHARE - ends.fibreRadius;
	const arrival = arrivalSwell * Math.exp(-distanceToEnd / (ends.toSomaRadius * ARRIVAL_LENGTH_SHARE));
	return ends.fibreRadius + Math.max(0, hillock) + Math.max(0, arrival);
}
