import { CatmullRomCurve3, Mesh, type Vector3 } from 'three';
import { axonPathOf, type AxonEnds } from './axonPath';
import { fibreGeometryFrom } from './fibreGeometry';
import { strandHeadingsOf } from './synapseHeadings';
import type { FibreMaterial } from './fibreMaterial';
import type { Synapse } from './constellationTypes';

const AXON_RADIAL_SEGMENTS = 8;
const PULSE_SAMPLE_COUNT = 32;

export type SynapseStrand = {
	mesh: Mesh;
	pulsePoints: Vector3[];
	contextKey: string;
	touches: (slug: string) => boolean;
	orientFrom: (slug: string) => void;
	setGrowth: (share: number) => void;
	dispose: () => void;
};

export function createSynapseStrand(
	synapse: Synapse,
	contextKey: string,
	material: FibreMaterial,
	ends: AxonEnds
): SynapseStrand {
	const path = axonPathOf(synapse, strandHeadingsOf(synapse), ends);
	const geometry = fibreGeometryFrom(path, AXON_RADIAL_SEGMENTS);
	const mesh = new Mesh(geometry, material);
	const pulsePoints = new CatmullRomCurve3(path.points).getSpacedPoints(PULSE_SAMPLE_COUNT);

	function orientFrom(slug: string): void {
		material.growFrom(slug === synapse.toSlug ? 'tip' : 'root');
	}

	return {
		mesh,
		pulsePoints,
		contextKey,
		touches: (slug) => slug === synapse.fromSlug || slug === synapse.toSlug,
		orientFrom,
		setGrowth: material.setGrowth.bind(material),
		dispose: () => geometry.dispose()
	};
}
