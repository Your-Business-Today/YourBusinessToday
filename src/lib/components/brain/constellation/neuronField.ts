import { Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, type Vector3 } from 'three';
import { nucleusColourOf } from './bodyColours';
import { connectionDirectionsOf } from './connectionDirections';
import { detailShareFor } from './dendriteDetail';
import { createNeuronBody, type NeuronBody } from './neuronBody';
import { kindColourOf } from './constellationPalette';
import { neuronProportions, nucleusProportions, type BodyProportions } from './neuronProportions';
import { WHOLE_MODEL_KEY, type MaterialBank } from './materialBank';
import type { CellMaterialBank } from './cellMaterialBank';
import type { ConstellationModel } from './constellationTypes';

const SOMA_DETAIL = 4;
const HIT_DETAIL = 1;
const TWINKLE_SHARE = 0.12;
const TWINKLE_SPEED = 1.6;

export type NeuronField = {
	group: Group;
	hitTargets: Mesh[];
	bodyFor: (slug: string) => NeuronBody | undefined;
	twinkle: (timeSeconds: number, deltaSeconds: number) => void;
	dispose: () => void;
};

export function createNeuronField(
	model: ConstellationModel,
	bank: MaterialBank,
	cells: CellMaterialBank
): NeuronField {
	const group = new Group();
	const hitTargets: Mesh[] = [];
	const bodies = new Map<string, NeuronBody>();
	const somaGeometry = new IcosahedronGeometry(1, SOMA_DETAIL);
	const hitGeometry = new IcosahedronGeometry(1, HIT_DETAIL);
	const hitMaterial = new MeshBasicMaterial({ visible: false });
	const directionsBySlug = connectionDirectionsOf(model);
	const detailShare = detailShareFor(model.neurons.length);

	function grow(
		slug: string,
		position: Vector3,
		colour: number,
		contextKey: string,
		proportions: BodyProportions,
		userData: Record<string, string>
	): void {
		const body = createNeuronBody({
			slug,
			position,
			colour,
			contextKey,
			proportions,
			connectionDirections: directionsBySlug.get(slug) ?? [],
			detailShare,
			somaGeometry,
			hitGeometry,
			hitMaterial,
			bank,
			cells,
			userData
		});
		bodies.set(slug, body);
		hitTargets.push(body.hitTarget);
		group.add(body.group);
	}

	for (const neuron of model.neurons) {
		const contextKey = neuron.contextSlug ?? WHOLE_MODEL_KEY;
		grow(neuron.slug, neuron.position, kindColourOf(neuron.kind), contextKey, neuronProportions, {
			neuronSlug: neuron.slug
		});
	}
	for (const nucleus of model.nuclei) {
		grow(nucleus.slug, nucleus.position, nucleusColourOf(nucleus), nucleus.slug, nucleusProportions, {
			nucleusSlug: nucleus.slug
		});
	}

	function twinkle(timeSeconds: number, deltaSeconds: number): void {
		for (const body of bodies.values()) {
			const shimmer = TWINKLE_SHARE * Math.sin(timeSeconds * TWINKLE_SPEED + body.twinklePhase);
			body.glowPulse(1 + shimmer, deltaSeconds);
		}
	}

	function dispose(): void {
		for (const body of bodies.values()) body.dispose();
		somaGeometry.dispose();
		hitGeometry.dispose();
		hitMaterial.dispose();
	}

	return { group, hitTargets, bodyFor: (slug) => bodies.get(slug), twinkle, dispose };
}
