import { Group, Mesh, type BufferGeometry, type MeshBasicMaterial, type Vector3 } from 'three';
import { createCellSoma } from './cellSoma';
import { growDendriteTree } from './dendriteTree';
import { mergedFibreGeometry } from './fibreGeometry';
import { clampShare, flare } from './growthShares';
import { shareStreamFrom } from './pseudoRandom';
import type { BodyProportions } from './neuronProportions';
import type { MaterialBank } from './materialBank';
import type { CellMaterialBank } from './cellMaterialBank';

const DENDRITE_RADIAL_SEGMENTS = 5;
const SOMA_PHASE_END = 0.4;
const DENDRITE_PHASE_START = 0.25;

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
	const { slug, position, colour, contextKey, proportions, bank, cells } = seed;
	const nextShare = shareStreamFrom(slug);

	const soma = createCellSoma({
		slug,
		position,
		colour,
		contextKey,
		proportions,
		somaGeometry: seed.somaGeometry,
		bank,
		cells
	});

	const tree = growDendriteTree(
		slug,
		seed.connectionDirections,
		proportions,
		seed.detailShare,
		nextShare
	);
	const dendriteMaterial = cells.dendritesFor(slug, colour, contextKey);
	const dendrites = new Mesh(
		mergedFibreGeometry(tree, DENDRITE_RADIAL_SEGMENTS),
		dendriteMaterial
	);
	dendrites.position.copy(position);

	const hitTarget = new Mesh(seed.hitGeometry, seed.hitMaterial);
	hitTarget.position.copy(position);
	hitTarget.scale.setScalar(proportions.hitRadius);
	hitTarget.userData = seed.userData;

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
		twinklePhase: position.x + position.y * 7,
		setGrowth,
		glowPulse: soma.glowPulse,
		excite: soma.excite,
		dispose: () => dendrites.geometry.dispose()
	};
}
