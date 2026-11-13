import { BufferAttribute, BufferGeometry, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { framesAlong, type FibreFrame } from './fibreFrames';

const FULL_TURN_RADIANS = Math.PI * 2;
const AXES_PER_VERTEX = 3;
const VALUES_PER_REACH = 1;

export type FibrePath = { points: Vector3[]; radii: number[]; reachShares: number[] };

type FibreBuffers = { positions: Float32Array; normals: Float32Array; spines: Float32Array; reachShares: Float32Array };

type FibreRing = { centre: Vector3; frame: FibreFrame; radius: number; reachShare: number; firstVertex: number };

export function fibreGeometryFrom(path: FibrePath, radialSegments: number): BufferGeometry {
	const { points, radii, reachShares } = path;
	const ringCount = points.length;
	const buffers = buffersFor(ringCount * radialSegments);
	const frames = framesAlong(points);
	for (let ringIndex = 0; ringIndex < ringCount; ringIndex += 1) {
		const ring = { centre: points[ringIndex], frame: frames[ringIndex], radius: radii[ringIndex], reachShare: reachShares[ringIndex] };
		writeRing(buffers, { ...ring, firstVertex: ringIndex * radialSegments }, radialSegments);
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(buffers.positions, AXES_PER_VERTEX));
	geometry.setAttribute('normal', new BufferAttribute(buffers.normals, AXES_PER_VERTEX));
	geometry.setAttribute('spine', new BufferAttribute(buffers.spines, AXES_PER_VERTEX));
	geometry.setAttribute('reachShare', new BufferAttribute(buffers.reachShares, VALUES_PER_REACH));
	geometry.setIndex(tubeIndices(ringCount, radialSegments));
	return geometry;
}

function buffersFor(vertexCount: number): FibreBuffers {
	const axisValues = vertexCount * AXES_PER_VERTEX;
	return {
		positions: new Float32Array(axisValues),
		normals: new Float32Array(axisValues),
		spines: new Float32Array(axisValues),
		reachShares: new Float32Array(vertexCount)
	};
}

function writeRing(buffers: FibreBuffers, ring: FibreRing, radialSegments: number): void {
	const { centre, frame, radius, reachShare, firstVertex } = ring;
	const { normal, binormal } = frame;
	const outward = new Vector3();
	const surface = new Vector3();
	for (let spoke = 0; spoke < radialSegments; spoke += 1) {
		const vertexIndex = firstVertex + spoke;
		const offset = vertexIndex * AXES_PER_VERTEX;
		const angle = (spoke / radialSegments) * FULL_TURN_RADIANS;
		outward.copy(normal).multiplyScalar(Math.cos(angle));
		outward.addScaledVector(binormal, Math.sin(angle));
		surface.copy(centre).addScaledVector(outward, radius);
		outward.toArray(buffers.normals, offset);
		centre.toArray(buffers.spines, offset);
		surface.toArray(buffers.positions, offset);
		buffers.reachShares[vertexIndex] = reachShare;
	}
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
