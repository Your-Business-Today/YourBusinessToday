import { Group, Mesh, type BufferGeometry, type MeshBasicMaterial, type Vector3 } from 'three';
import { createCellSoma } from './cellSoma';
import { clampShare, flare } from './growthShares';
import type { BodyProportions } from './neuronProportions';
import type { MaterialBank } from './materialBank';
import type { CellMaterialBank } from './cellMaterialBank';

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
};

export type BodySeed = {
	slug: string;
	position: Vector3;
	colour: number;
	contextKey: string;
	proportions: BodyProportions;
	somaGeometry: BufferGeometry;
	hitGeometry: BufferGeometry;
	hitMaterial: MeshBasicMaterial;
	bank: MaterialBank;
	cells: CellMaterialBank;
	userData: Record<string, string>;
};

/** One page as a cell: a glowing body and the target a pointer picks it by. Its only fibres are the synapses it really has. */
export function createNeuronBody(seed: BodySeed): NeuronBody {
	const { position, colour } = seed;
	const soma = createCellSoma(seed);
	const hitTarget = hitTargetOf(seed);
	const group = new Group();
	group.add(soma.core, soma.glow, hitTarget);
	return {
		group,
		hitTarget,
		position,
		colour,
		twinklePhase: position.x + position.y * TWINKLE_PHASE_SPREAD,
		setGrowth: (share) => soma.setGrowth(flare(clampShare(share))),
		glowPulse: soma.glowPulse,
		excite: soma.excite
	};
}

function hitTargetOf(seed: BodySeed): Mesh {
	const { hitGeometry, hitMaterial, position, proportions, userData } = seed;
	const hitTarget = new Mesh(hitGeometry, hitMaterial);
	hitTarget.position.copy(position);
	hitTarget.scale.setScalar(proportions.hitRadius);
	hitTarget.userData = userData;
	return hitTarget;
}
