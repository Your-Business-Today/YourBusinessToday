import { Group, IcosahedronGeometry, Mesh, MeshBasicMaterial, type Vector3 } from 'three';
import { nucleusColourOf } from './bodyColours';
import { connectionDirectionsOf } from './connectionDirections';
import { detailShareFor } from './dendriteDetail';
import { createNeuronBody, type NeuronBody } from './neuronBody';
import { kindColourOf } from './constellationPalette';
import { neuronProportions, nucleusProportions, type BodyProportions } from './neuronProportions';
import { WHOLE_MODEL_KEY, type MaterialBank } from './materialBank';
import type { CellMaterialBank } from './cellMaterialBank';
import type { ConstellationModel, Neuron, Nucleus } from './constellationTypes';

const SOMA_DETAIL = 4;
const HIT_DETAIL = 1;
const TWINKLE_SHARE = 0.12;
const TWINKLE_SPEED = 1.6;
const RESTING_GLOW = 1;

type GrownCell = { slug: string; position: Vector3; colour: number; contextKey: string; proportions: BodyProportions; userData: Record<string, string> };

/** Every neuron and every area's nucleus, grown as a cell with its dendrites, and the targets a pointer picks them by. */
export class NeuronField {
	readonly group = new Group();
	readonly hitTargets: Mesh[] = [];
	private readonly bodies = new Map<string, NeuronBody>();
	private readonly somaGeometry = new IcosahedronGeometry(1, SOMA_DETAIL);
	private readonly hitGeometry = new IcosahedronGeometry(1, HIT_DETAIL);
	private readonly hitMaterial = new MeshBasicMaterial({ visible: false });
	private readonly directionsBySlug: Map<string, Vector3[]>;
	private readonly detailShare: number;

	constructor(
		model: ConstellationModel,
		private readonly bank: MaterialBank,
		private readonly cells: CellMaterialBank
	) {
		const { neurons, nuclei } = model;
		this.directionsBySlug = connectionDirectionsOf(model);
		this.detailShare = detailShareFor(neurons.length);
		for (const neuron of neurons) this.grow(neuronCellOf(neuron));
		for (const nucleus of nuclei) this.grow(nucleusCellOf(nucleus));
	}

	bodyFor(slug: string): NeuronBody | undefined {
		return this.bodies.get(slug);
	}

	twinkle(timeSeconds: number, deltaSeconds: number): void {
		for (const body of this.bodies.values()) {
			const shimmer = TWINKLE_SHARE * Math.sin(timeSeconds * TWINKLE_SPEED + body.twinklePhase);
			body.glowPulse(RESTING_GLOW + shimmer, deltaSeconds);
		}
	}

	dispose(): void {
		for (const body of this.bodies.values()) body.dispose();
		this.somaGeometry.dispose();
		this.hitGeometry.dispose();
		this.hitMaterial.dispose();
	}

	private grow(cell: GrownCell): void {
		const { somaGeometry, hitGeometry, hitMaterial, bank, cells, detailShare } = this;
		const connectionDirections = this.directionsBySlug.get(cell.slug) ?? [];
		const shared = { somaGeometry, hitGeometry, hitMaterial, bank, cells, detailShare };
		const body = createNeuronBody({ ...cell, ...shared, connectionDirections });
		this.bodies.set(cell.slug, body);
		this.hitTargets.push(body.hitTarget);
		this.group.add(body.group);
	}
}

function neuronCellOf(neuron: Neuron): GrownCell {
	const { slug, position, kind, contextSlug } = neuron;
	const contextKey = contextSlug ?? WHOLE_MODEL_KEY;
	return { slug, position, colour: kindColourOf(kind), contextKey, proportions: neuronProportions, userData: { neuronSlug: slug } };
}

function nucleusCellOf(nucleus: Nucleus): GrownCell {
	const { slug, position } = nucleus;
	return { slug, position, colour: nucleusColourOf(nucleus), contextKey: slug, proportions: nucleusProportions, userData: { nucleusSlug: slug } };
}
