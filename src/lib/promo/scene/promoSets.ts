import { Vector3 } from 'three';

export type Point = { x: number; y: number; z: number };

/** Where each chapter's set stands in the world: the camera flies from one to the next. */
export const promoSets = {
	signal: { x: 0, y: 0, z: 0 },
	map: { x: 0, y: -10, z: -4 },
	board: { x: 0, y: 4, z: -48 },
	app: { x: 0, y: 33, z: -48 }
} satisfies Record<string, Point>;

export function vectorOf(point: Point): Vector3 {
	return new Vector3(point.x, point.y, point.z);
}

export function offsetFrom(origin: Point, x: number, y: number, z: number): Vector3 {
	return new Vector3(origin.x + x, origin.y + y, origin.z + z);
}
