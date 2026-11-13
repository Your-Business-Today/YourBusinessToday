import { QuadraticBezierCurve3, Vector3 } from 'three';
import { perpendicularTo } from './fibreFrames';

const NEIGHBOUR_LINK_COUNT = 2;
const LONGEST_LINK = 1.2;
const ARC_BEND_SHARE = 0.18;
const ARC_SEGMENTS = 6;
const FULL_TURN_RADIANS = Math.PI * 2;

export type ClearZone = { centre: Vector3; radius: number };

export type AmbientLink = { start: Vector3; end: Vector3; arc: Vector3[] };

export function linksAmong(anchors: Vector3[]): AmbientLink[] {
	const links: AmbientLink[] = [];
	for (let index = 0; index < anchors.length; index += 1) {
		for (const neighbour of nearestNeighbours(anchors, index)) {
			links.push(arcedLink(anchors[index], neighbour));
		}
	}
	return links;
}

export function linkPositions(links: AmbientLink[]): number[] {
	return links.flatMap((link) => segmentPositionsOf(link.arc));
}

export function crossesZone(link: AmbientLink, zone: ClearZone): boolean {
	const along = link.end.clone().sub(link.start);
	const toCentre = zone.centre.clone().sub(link.start);
	const share = Math.min(1, Math.max(0, toCentre.dot(along) / along.lengthSq()));
	const nearest = link.start.clone().addScaledVector(along, share);
	return nearest.distanceTo(zone.centre) < zone.radius;
}

function arcedLink(start: Vector3, end: Vector3): AmbientLink {
	const chord = end.clone().sub(start);
	const length = chord.length();
	const across = perpendicularTo(chord.clone().normalize());
	const up = chord.clone().normalize().cross(across);
	const swing = Math.random() * FULL_TURN_RADIANS;
	const bend = across
		.multiplyScalar(Math.cos(swing))
		.addScaledVector(up, Math.sin(swing))
		.multiplyScalar(length * ARC_BEND_SHARE * Math.random());
	const midpoint = start.clone().add(end).multiplyScalar(0.5).add(bend);
	const arc = new QuadraticBezierCurve3(start, midpoint, end).getPoints(ARC_SEGMENTS);
	return { start, end, arc };
}

function segmentPositionsOf(arc: Vector3[]): number[] {
	const positions: number[] = [];
	for (let index = 0; index < arc.length - 1; index += 1) {
		positions.push(...arc[index].toArray(), ...arc[index + 1].toArray());
	}
	return positions;
}

function nearestNeighbours(anchors: Vector3[], index: number): Vector3[] {
	const distances = anchors
		.map((candidate, candidateIndex) => ({
			candidate,
			candidateIndex,
			distance: candidate.distanceTo(anchors[index])
		}))
		.filter((entry) => entry.candidateIndex > index && entry.distance <= LONGEST_LINK)
		.sort((left, right) => left.distance - right.distance);
	return distances.slice(0, NEIGHBOUR_LINK_COUNT).map((entry) => entry.candidate);
}
