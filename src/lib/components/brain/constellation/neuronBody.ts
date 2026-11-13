import { Group, Mesh, type BufferGeometry, type MeshBasicMaterial, type Vector3 } from 'three';
import { createCellSoma } from './cellSoma';
import { growDendriteTree } from './dendriteTree';
import { mergedFibreGeometry } from './fibreGeometry';
import { clampShare, flare } from './growthShares';
import { shareStreamFrom } from './pseudoRandom';
import type { BodyProportions } from './neuronProportions';
import type { MaterialBank } from './materialBank';
import type { CellMaterialBank } from './cellMaterialBank';
import type { FibreMaterial } from './fibreMaterial';

const DENDRITE_RADIAL_SEGMENTS = 5;
const SOMA_PHASE_END = 0.4;
const DENDRITE_PHASE_START = 0.25;
const TWINKLE_PHASE_SPREAD = 7;

export type NeuronBody = {
	group: Group;
	hitTarget: Mesh;
	position: Vector3;
	colour: number;
	twinklePhase: number;
	setGrowth: (share: number) => void;
	glowPulse: (pulse: number, deltaSeconds: number) => void;
	excite: () => void;
	dispose: () => void;
};

export type BodySeed = {
	slug: string;
	position: Vector3;
	colour: number;
	contextKey: string;
	proportions: BodyProportions;
	connectionDirections: Vector3[];
	detailShare: number;
	somaGeometry: BufferGeometry;
	hitGeometry: BufferGeometry;
	hitMaterial: MeshBasicMaterial;
	bank: MaterialBank;
	cells: CellMaterialBank;
	userData: Record<string, string>;
};

export function createNeuronBody(seed: BodySeed): NeuronBody {
	const { slug, position, colour, contextKey, cells } = seed;
	const soma = createCellSoma(seed);
	const dendriteMaterial = cells.dendritesFor(slug, colour, contextKey);
	const dendrites = dendritesOf(seed, dendriteMaterial);
	const hitTarget = hitTargetOf(seed);
	const group = new Group();
	group.add(soma.core, soma.glow, dendrites, hitTarget);

	function setGrowth(share: number): void {
		soma.setGrowth(flare(clampShare(share / SOMA_PHASE_END)));
		const dendriteShare = clampShare((share - DENDRITE_PHASE_START) / (1 - DENDRITE_PHASE_START));
		dendriteMaterial.setGrowth(dendriteShare);
	}

	return {
		group,
		hitTarget,
		position,
		colour,
		twinklePhase: position.x + position.y * TWINKLE_PHASE_SPREAD,
		setGrowth,
		glowPulse: soma.glowPulse,
		excite: soma.excite,
		dispose: () => disposeGeometryOf(dendrites)
	};
}

function dendritesOf(seed: BodySeed, material: FibreMaterial): Mesh {
	const { slug, connectionDirections, proportions, detailShare, position } = seed;
	const tree = growDendriteTree(slug, connectionDirections, proportions, detailShare, shareStreamFrom(slug));
	const dendrites = new Mesh(mergedFibreGeometry(tree, DENDRITE_RADIAL_SEGMENTS), material);
	dendrites.position.copy(position);
	return dendrites;
}

function hitTargetOf(seed: BodySeed): Mesh {
	const { hitGeometry, hitMaterial, position, proportions, userData } = seed;
	const hitTarget = new Mesh(hitGeometry, hitMaterial);
	hitTarget.position.copy(position);
	hitTarget.scale.setScalar(proportions.hitRadius);
	hitTarget.userData = userData;
	return hitTarget;
}

function disposeGeometryOf(mesh: Mesh): void {
	mesh.geometry.dispose();
}
