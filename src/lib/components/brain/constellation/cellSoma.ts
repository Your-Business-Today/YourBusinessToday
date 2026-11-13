import { Mesh, Sprite, Vector3, type BufferGeometry } from 'three';
import { shareStreamFrom } from './pseudoRandom';
import type { BodyProportions } from './neuronProportions';
import type { MaterialBank } from './materialBank';
import type { CellMaterialBank } from './cellMaterialBank';

const SOMA_SQUASH_SPREAD = 0.35;
const FULL_TURN_RADIANS = Math.PI * 2;
const EXCITEMENT_FLARE = 0.9;
const EXCITEMENT_FADE_PER_SECOND = 2.6;

export type SomaProportions = Pick<BodyProportions, 'somaRadius' | 'glowScale'>;

export type CellSoma = {
	core: Mesh;
	glow: Sprite;
	setGrowth: (flareShare: number) => void;
	glowPulse: (pulse: number, deltaSeconds: number) => void;
	excite: () => void;
};

export type SomaSeed = {
	slug: string;
	position: Vector3;
	colour: number;
	contextKey: string;
	proportions: SomaProportions;
	somaGeometry: BufferGeometry;
	bank: MaterialBank;
	cells: CellMaterialBank;
};

export function somaRadiusOf(slug: string, proportions: SomaProportions): number {
	return proportions.somaRadius * somaSizeShareOf(slug);
}

export function createCellSoma(seed: SomaSeed): CellSoma {
	const { slug, position, colour, contextKey, proportions, bank, cells } = seed;
	const somaRadius = somaRadiusOf(slug, proportions);
	const nextShare = shareStreamFrom(`${slug}:soma`);

	const core = new Mesh(seed.somaGeometry, cells.somaFor(colour, contextKey));
	core.position.copy(position);
	core.rotation.set(spin(nextShare), spin(nextShare), spin(nextShare));

	const glow = new Sprite(bank.glowFor(colour, contextKey));
	glow.position.copy(position);

	let flareShare = 1;
	let excitement = 0;

	function setGrowth(grownFlareShare: number): void {
		flareShare = grownFlareShare;
		core.scale.setScalar(somaRadius * flareShare);
	}

	function glowPulse(pulse: number, deltaSeconds: number): void {
		excitement *= Math.exp(-EXCITEMENT_FADE_PER_SECOND * deltaSeconds);
		glow.scale.setScalar(proportions.glowScale * flareShare * (pulse + EXCITEMENT_FLARE * excitement));
	}

	setGrowth(1);
	glowPulse(1, 0);
	return { core, glow, setGrowth, glowPulse, excite: () => (excitement = 1) };
}

function somaSizeShareOf(slug: string): number {
	const share = shareStreamFrom(`${slug}:size`)();
	return 1 - SOMA_SQUASH_SPREAD / 2 + SOMA_SQUASH_SPREAD * share;
}

function spin(nextShare: () => number): number {
	return nextShare() * FULL_TURN_RADIANS;
}
