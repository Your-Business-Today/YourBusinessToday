import { Vector3 } from 'three';

const PARALLEL_EPSILON = 0.000001;
const FALLBACK_TANGENT = new Vector3(0, 0, 1);

export type FibreFrame = { tangent: Vector3; normal: Vector3; binormal: Vector3 };

export function framesAlong(points: Vector3[]): FibreFrame[] {
	const tangents = points.map((_, index) => tangentAt(points, index));
	const frames: FibreFrame[] = [];
	let normal = perpendicularTo(tangents[0]);
	for (const tangent of tangents) {
		normal = transported(normal, tangent);
		frames.push({ tangent, normal, binormal: tangent.clone().cross(normal) });
	}
	return frames;
}

function tangentAt(points: Vector3[], index: number): Vector3 {
	const previous = points[Math.max(0, index - 1)];
	const next = points[Math.min(points.length - 1, index + 1)];
	const tangent = next.clone().sub(previous);
	if (tangent.lengthSq() < PARALLEL_EPSILON) return FALLBACK_TANGENT.clone();
	return tangent.normalize();
}

function transported(previousNormal: Vector3, tangent: Vector3): Vector3 {
	const projected = previousNormal
		.clone()
		.addScaledVector(tangent, -previousNormal.dot(tangent));
	if (projected.lengthSq() < PARALLEL_EPSILON) return perpendicularTo(tangent);
	return projected.normalize();
}

export function perpendicularTo(tangent: Vector3): Vector3 {
	const isLeaningAlongX = Math.abs(tangent.x) > Math.abs(tangent.y);
	const leastAlignedAxis = isLeaningAlongX ? new Vector3(0, 1, 0) : new Vector3(1, 0, 0);
	return leastAlignedAxis.cross(tangent).normalize();
}
