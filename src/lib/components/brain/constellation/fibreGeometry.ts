import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { framesAlong } from './fibreFrames';

const FULL_TURN_RADIANS = Math.PI * 2;
const AXES_PER_VERTEX = 3;

export type FibrePath = { points: Vector3[]; radii: number[]; reachShares: number[] };

export function fibreGeometryFrom(path: FibrePath, radialSegments: number): BufferGeometry {
	const ringCount = path.points.length;
	const vertexCount = ringCount * radialSegments;
	const positions = new Float32Array(vertexCount * AXES_PER_VERTEX);
	const normals = new Float32Array(vertexCount * AXES_PER_VERTEX);
	const spines = new Float32Array(vertexCount * AXES_PER_VERTEX);
	const reachShares = new Float32Array(vertexCount);
	const frames = framesAlong(path.points);
	const outward = new Vector3();
	const surface = new Vector3();
	for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
		const centre = path.points[ringIndex];
		const { normal, binormal } = frames[ringIndex];
		for (let spoke = 0; spoke < radialSegments; spoke += 1) {
			const vertexIndex = ringIndex * radialSegments + spoke;
			const angle = (spoke / radialSegments) * FULL_TURN_RADIANS;
			outward.copy(normal).multiplyScalar(Math.cos(angle));
			outward.addScaledVector(binormal, Math.sin(angle));
			surface.copy(centre).addScaledVector(outward, path.radii[ringIndex]);
			outward.toArray(normals, vertexIndex * AXES_PER_VERTEX);
			centre.toArray(spines, vertexIndex * AXES_PER_VERTEX);
			surface.toArray(positions, vertexIndex * AXES_PER_VERTEX);
			reachShares[vertexIndex] = path.reachShares[ringIndex];
		}
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(positions, AXES_PER_VERTEX));
	geometry.setAttribute('normal', new BufferAttribute(normals, AXES_PER_VERTEX));
	geometry.setAttribute('spine', new BufferAttribute(spines, AXES_PER_VERTEX));
	geometry.setAttribute('reachShare', new BufferAttribute(reachShares, 1));
	geometry.setIndex(tubeIndices(ringCount, radialSegments));
	return geometry;
}

export function mergedFibreGeometry(paths: FibrePath[], radialSegments: number): BufferGeometry {
	if (paths.length === 0) return new BufferGeometry();
	const tubes = paths.map((path) => fibreGeometryFrom(path, radialSegments));
	const merged = mergeGeometries(tubes) ?? new BufferGeometry();
	for (const tube of tubes) tube.dispose();
	return merged;
}

function tubeIndices(ringCount: number, radialSegments: number): number[] {
	const indices: number[] = [];
	for (let ringIndex = 0; ringIndex < ringCount - 1; ringIndex += 1) {
		for (let spoke = 0; spoke < radialSegments; spoke += 1) {
			const here = ringIndex * radialSegments + spoke;
			const nextSpoke = ringIndex * radialSegments + ((spoke + 1) % radialSegments);
			const ahead = here + radialSegments;
			const aheadNextSpoke = nextSpoke + radialSegments;
			indices.push(here, nextSpoke, ahead, nextSpoke, aheadNextSpoke, ahead);
		}
	}
	return indices;
}
