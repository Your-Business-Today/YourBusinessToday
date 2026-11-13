import { domainPageKinds, type DomainPageKind } from '$lib/data/businessBrainDomain';

/** What a thing is, in plain words, for each kind the domain is modelled in underneath. */
const thingKindWords: Partial<Record<DomainPageKind, string>> = {
	[domainPageKinds.entity]: 'Record',
	[domainPageKinds.valueObject]: 'Detail',
	[domainPageKinds.aggregate]: 'Group',
	[domainPageKinds.domainService]: 'Operation',
	[domainPageKinds.domainEvent]: 'Event'
};

export function thingKindWord(kind: DomainPageKind): string {
	return thingKindWords[kind] ?? '';
}
