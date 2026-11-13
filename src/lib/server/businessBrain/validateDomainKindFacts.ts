import { domainPageKinds, type DomainPageKind, type DomainTermFact } from '$lib/data/businessBrainDomain';
import { domainFilingLimits, domainKindsWithFields, type DomainPageFactsGiven } from '$lib/data/businessBrainDomainRules';
import { isPageSlug, lengthRefusal, slugRefusal } from './businessBrainFieldRefusals';
import { isPlainObject, type PlainObject } from '$lib/data/plainObject';
import { trimmedText } from '$lib/data/trimmedText';
import { validateDomainFacts } from './validateDomainFacts';

const { mostGoverned, mostTerms, longestWord, longestMeaning } = domainFilingLimits;

export const governsRefusal = `A rule names the things it governs by their slugs in governs: at least one and at most ${mostGoverned}, each once.`;

export const termsRefusal = `The terms are a list of at most ${mostTerms}, each a word with its meaning.`;

/** The facts a page of its kind carries, checked, or a sentence naming the first that does not fit; null for a kind that carries none. */
export function validateDomainKindFacts(kind: DomainPageKind, entry: PlainObject, label: string): DomainPageFactsGiven | string | null {
	if (domainKindsWithFields.includes(kind)) return validateDomainFacts(entry, label);
	if (kind === domainPageKinds.rule) return validateGoverns(entry.governs, label);
	if (kind === domainPageKinds.glossary) return validateTerms(entry.terms, label);
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

function validateTerms(given: unknown, label: string): { terms: DomainTermFact[] } | string {
	if (given === undefined) return { terms: [] };
	if (!Array.isArray(given) || given.length > mostTerms) return `${label}: ${termsRefusal}`;
	const terms: DomainTermFact[] = [];
	for (const [index, term] of given.entries()) {
		const checked = validateTerm(isPlainObject(term) ? term : {}, `${label}, term ${index + 1}`);
		if (typeof checked === 'string') return checked;
		terms.push(checked);
	}
	return { terms };
}

function validateTerm(term: PlainObject, label: string): DomainTermFact | string {
	const word = trimmedText(term.word);
	const meaning = trimmedText(term.meaning);
	const refusal = lengthRefusal('word', word, longestWord, true) ?? lengthRefusal('meaning', meaning, longestMeaning, true);
	return refusal === null ? { word, meaning } : `${label}: ${refusal}`;
}
