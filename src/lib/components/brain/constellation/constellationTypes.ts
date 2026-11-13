import type { Vector3 } from 'three';

export type Neuron = {
	slug: string;
	title: string;
	summary: string;
	kind: string;
	contextSlug: string | null;
	position: Vector3;
};

export type Nucleus = {
	slug: string;
	name: string;
	summary: string;
	isCoreDomain: boolean;
	position: Vector3;
	clusterRadius: number;
};

export type SynapseKind = 'dendrite' | 'crosslink';

export type Synapse = {
	kind: SynapseKind;
	contextSlug: string | null;
	fromSlug: string;
	toSlug: string;
	from: Vector3;
	to: Vector3;
};

export type ConstellationModel = {
	nuclei: Nucleus[];
	neurons: Neuron[];
	synapses: Synapse[];
};

export type ConstellationHover = {
	neuronSlug?: string;
	nucleusSlug?: string;
	x: number;
	y: number;
};

export type ConstellationCallbacks = {
	onHover: (hover: ConstellationHover | null) => void;
	onSelectNeuron: (slug: string) => void;
	onFocusContext: (contextSlug: string | null) => void;
};
