import type { Vector3 } from 'three';

export function distancesAlong(points: Vector3[]): number[] {
	const distances = [0];
	for (let index = 1; index < points.length; index += 1) {
		distances.push(distances[index - 1] + points[index].distanceTo(points[index - 1]));
	}
	return distances;
}
