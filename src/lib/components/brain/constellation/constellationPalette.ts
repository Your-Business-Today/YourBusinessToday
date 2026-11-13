import { domainPageKinds } from '$lib/data/businessBrainDomain';

export const NIGHT_SKY = 0x0b0e16;
export const CHALK = 0xeef1f8;
export const SIGNAL = 0xff4d5e;
export const SILVER = 0xc9d2e6;
export const HALO = 0xd6ddf5;
export const STARLIGHT = 0x6c7694;
export const DENDRITE = 0x8ea3e0;
export const CROSSLINK = 0xa6b6ea;

/** The colour of a neuron of a kind the brain has no colour of its own for. */
export const otherKindColour = 0xb8c0d6;

/** Each kind of page the domain is filed in keeps its own colour of neuron. */
export const kindColours: Record<string, number> = {
	[domainPageKinds.entity]: 0x9db6ff,
	[domainPageKinds.valueObject]: 0x8fe6bd,
	[domainPageKinds.aggregate]: 0xffd89a,
	[domainPageKinds.domainService]: 0xc4aeff,
	[domainPageKinds.domainEvent]: 0xffab8a,
	[domainPageKinds.rule]: 0xff8fb1,
	[domainPageKinds.glossary]: 0x9fe8e8,
	[domainPageKinds.contextMap]: 0xeef1f8
};

/** The colour of a neuron of the kind given. */
export function kindColourOf(kind: string): number {
	return kindColours[kind] ?? otherKindColour;
}

export function asCssColour(colour: number): string {
	return `#${colour.toString(16).padStart(6, '0')}`;
}
