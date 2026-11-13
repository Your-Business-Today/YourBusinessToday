import { domainFilingLimits } from '$lib/data/businessBrainDomainRules';
import { isPageSlug, lengthRefusal, slugRefusal } from './businessBrainFieldRefusals';
import { isPlainObject, type PlainObject } from '$lib/data/plainObject';
import { trimmedText } from '$lib/data/trimmedText';
import type { DomainGlossaryFactsGiven, DomainTermGiven, DomainTermNamingGiven } from '$lib/data/businessBrainDomainFactsGiven';

const { mostTerms, longestWord, longestMeaning, longestStatus, mostOtherNames } = domainFilingLimits;

export const termsRefusal = `The terms are a list of at most ${mostTerms}, each a word with its meaning.`;

export const otherNamesRefusal = `otherNames is a list of at most ${mostOtherNames} other words for it, each at most ${longestWord} characters, given once and never the word itself.`;

export const namesStatusRefusal = 'namesStatus is a status of the thing the word names, so it comes with namesThingSlug.';

/** A glossary's words as given, or a sentence naming the first that does not fit. */
export function validateDomainTerms(given: unknown, label: string): DomainGlossaryFactsGiven | string {
	if (given === undefined) return { terms: [] };
	if (!Array.isArray(given) || given.length > mostTerms) return `${label}: ${termsRefusal}`;
	const terms: DomainTermGiven[] = [];
	for (const [index, term] of given.entries()) {
		const checked = validateTerm(isPlainObject(term) ? term : {}, `${label}, term ${index + 1}`);
		if (typeof checked === 'string') return checked;
		terms.push(checked);
	}
	return { terms };
}

function validateTerm(term: PlainObject, label: string): DomainTermGiven | string {
	const word = trimmedText(term.word);
	const meaning = trimmedText(term.meaning);
	const refusal = lengthRefusal('word', word, longestWord, true) ?? lengthRefusal('meaning', meaning, longestMeaning, true);
	if (refusal !== null) return `${label}: ${refusal}`;
	const naming = validateTermNaming(term, word);
	return typeof naming === 'string' ? `${label} (${word}): ${naming}` : { word, meaning, ...naming };
}

function validateTermNaming(term: PlainObject, word: string): DomainTermNamingGiven | string {
	const namesThingSlug = trimmedText(term.namesThingSlug);
	const namesStatus = trimmedText(term.namesStatus);
	const isThingNamed = namesThingSlug !== '';
	if (isThingNamed && !isPageSlug(namesThingSlug)) return `namesThingSlug. ${slugRefusal}`;
	const isStatusNamed = namesStatus !== '';
	if (isStatusNamed && !isThingNamed) return namesStatusRefusal;
	const statusRefusal = lengthRefusal('namesStatus', namesStatus, longestStatus, false);
	if (statusRefusal !== null) return statusRefusal;
	const otherNames = validateOtherNames(term.otherNames, word);
	if (otherNames === null) return otherNamesRefusal;
	return namingGiven({ namesThingSlug, namesStatus, isRole: term.isRole === true, otherNames });
}

function validateOtherNames(given: unknown, word: string): string[] | null {
	if (given === undefined) return [];
	if (!Array.isArray(given) || given.length > mostOtherNames) return null;
	const otherNames = given.map(trimmedText);
	const isEachFitting = otherNames.every((name) => name !== '' && name.length <= longestWord && name !== word);
	const isEachOnce = new Set(otherNames).size === otherNames.length;
	return isEachFitting && isEachOnce ? otherNames : null;
}

type NamingAsChecked = { namesThingSlug: string; namesStatus: string; isRole: boolean; otherNames: string[] };

/** Only what the word was given, so a plain word is kept as a word and its meaning, as words were before they named things. */
function namingGiven({ namesThingSlug, namesStatus, isRole, otherNames }: NamingAsChecked): DomainTermNamingGiven {
	return {
		...(namesThingSlug === '' ? {} : { namesThingSlug }),
		...(namesStatus === '' ? {} : { namesStatus }),
		...(isRole ? { isRole } : {}),
		...(otherNames.length === 0 ? {} : { otherNames })
	};
}
