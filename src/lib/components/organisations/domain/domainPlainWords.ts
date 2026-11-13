import { areaRelationshipPatterns, domainPageKinds, subdomainKinds, type DomainPageKind } from '$lib/data/businessBrainDomain';
import type { AreaRelationshipPattern, SubdomainKind } from '$lib/data/businessBrainDomain';

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

/** What part an area plays, in plain words. */
const areaPartWords: Record<SubdomainKind, string> = {
	[subdomainKinds.core]: 'Core: what sets the business apart',
	[subdomainKinds.supporting]: 'Supporting: needed, and particular to the business',
	[subdomainKinds.generic]: 'Generic: any business has it'
};

export function areaPartWord(part: SubdomainKind | null): string {
	return part === null ? 'Not said yet' : areaPartWords[part];
}

/** Whose terms win when one area passes something to another, in plain words. */
export const relationshipTermsWords: Record<AreaRelationshipPattern, string> = {
	[areaRelationshipPatterns.customerSupplier]: 'The receiving area says what it needs',
	[areaRelationshipPatterns.conformist]: 'The receiving area takes it as it comes',
	[areaRelationshipPatterns.sharedKernel]: 'Both keep the same record',
	[areaRelationshipPatterns.anticorruptionLayer]: 'The receiving area renames it',
	[areaRelationshipPatterns.publishedLanguage]: 'A fixed format both follow'
};
