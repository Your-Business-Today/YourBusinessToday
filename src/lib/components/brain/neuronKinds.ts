import { domainBlockNames, domainPageKinds, type DomainPageKind } from '$lib/data/businessBrainDomain';

const wordSeparator = '_';

/** The kinds the key lists: every kind a neuron of the domain can be, but the areas, which are lobes, and the one map. */
export const keyedNeuronKinds: DomainPageKind[] = [
	domainPageKinds.entity,
	domainPageKinds.valueObject,
	domainPageKinds.aggregate,
	domainPageKinds.domainService,
	domainPageKinds.domainEvent,
	domainPageKinds.rule,
	domainPageKinds.glossary
];

/** What a page of the kind given is called: the domain's own name for it, or its kind in words. */
export function neuronKindLabel(kind: string): string {
	const domainName = domainBlockNames[kind as DomainPageKind];
	if (domainName !== undefined) return domainName;
	const words = kind.replaceAll(wordSeparator, ' ');
	return words.charAt(0).toUpperCase() + words.slice(1);
}
