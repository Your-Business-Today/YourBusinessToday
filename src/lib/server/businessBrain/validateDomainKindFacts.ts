import { domainPageKinds, type DomainPageKind } from '$lib/data/businessBrainDomain';
import { domainKindsWithFields } from '$lib/data/businessBrainDomainRules';
import { validateAreaRelationships } from './validateAreaRelationships';
import { validateDomainFacts } from './validateDomainFacts';
import { validateDomainTerms } from './validateDomainTerms';
import { validateEventFacts } from './validateEventFacts';
import { validateRuleFacts } from './validateRuleFacts';
import type { DomainPageFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { PlainObject } from '$lib/data/plainObject';

/** The facts a page of its kind carries, checked, or a sentence naming the first that does not fit; null for a kind that carries none. */
export function validateDomainKindFacts(kind: DomainPageKind, entry: PlainObject, label: string): DomainPageFactsGiven | string | null {
	if (domainKindsWithFields.includes(kind)) return validateDomainFacts(entry, label);
	if (kind === domainPageKinds.rule) return validateRuleFacts(entry, label);
	if (kind === domainPageKinds.domainEvent) return validateEventFacts(entry, label);
	if (kind === domainPageKinds.glossary) return validateDomainTerms(entry.terms, label);
	if (kind === domainPageKinds.contextMap) return validateAreaRelationships(entry.relationships, label);
	return null;
}
