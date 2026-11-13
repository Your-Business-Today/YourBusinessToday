import { domainPageKinds, type DomainPageKind } from '$lib/data/businessBrainDomain';
import { domainFilingLimits, domainKindsWithFields } from '$lib/data/businessBrainDomainRules';
import { isPageSlug, slugRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validateAreaRelationships } from './validateAreaRelationships';
import { validateDomainFacts } from './validateDomainFacts';
import { validateDomainTerms } from './validateDomainTerms';
import type { DomainPageFactsGiven } from '$lib/data/businessBrainDomainFactsGiven';
import type { PlainObject } from '$lib/data/plainObject';

const { mostGoverned } = domainFilingLimits;

export const governsRefusal = `A rule names the things it governs by their slugs in governs: at least one and at most ${mostGoverned}, each once.`;

/** The facts a page of its kind carries, checked, or a sentence naming the first that does not fit; null for a kind that carries none. */
export function validateDomainKindFacts(kind: DomainPageKind, entry: PlainObject, label: string): DomainPageFactsGiven | string | null {
	if (domainKindsWithFields.includes(kind)) return validateDomainFacts(entry, label);
	if (kind === domainPageKinds.rule) return validateGoverns(entry.governs, label);
	if (kind === domainPageKinds.glossary) return validateDomainTerms(entry.terms, label);
	if (kind === domainPageKinds.contextMap) return validateAreaRelationships(entry.relationships, label);
	return null;
}

function validateGoverns(given: unknown, label: string): { governs: string[] } | string {
	if (!Array.isArray(given) || given.length === 0 || given.length > mostGoverned) return `${label}: ${governsRefusal}`;
	const governs = given.map(trimmedText);
	const isEverySlugFitting = governs.every(isPageSlug);
	if (!isEverySlugFitting) return `${label}: governs. ${slugRefusal}`;
	const isEachOnce = new Set(governs).size === governs.length;
	return isEachOnce ? { governs } : `${label}: ${governsRefusal}`;
}
