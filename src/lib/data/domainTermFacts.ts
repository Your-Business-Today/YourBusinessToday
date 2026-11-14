import { isPlainObject, type PlainObject } from './plainObject';
import { isFilledText } from './filledText';
import type { DomainTermFact, DomainTermNaming } from './businessBrainDomain';

const namesNothing: DomainTermNaming = { namesThingSlug: null, namesStatus: null, isRole: false, otherNames: [] };

/** A word with its meaning that names nothing further: a plain term, as a glossary in prose gives one. */
export function plainDomainTerm(word: string, meaning: string): DomainTermFact {
	return { word, meaning, ...namesNothing };
}

/** The words a glossary's facts list; a word with no meaning is left out, and a word filed before words named things names nothing. */
export function readDomainTerms(given: unknown): DomainTermFact[] {
	if (!Array.isArray(given)) return [];
	return given.filter(isPlainObject).filter(isWordAndMeaning).map(termFact);
}

function termFact(term: PlainObject): DomainTermFact {
	const namesThingSlug = isFilledText(term.namesThingSlug) ? term.namesThingSlug : null;
	const namesStatus = namesThingSlug !== null && isFilledText(term.namesStatus) ? term.namesStatus : null;
	const otherNames = Array.isArray(term.otherNames) ? term.otherNames.filter(isFilledText) : [];
	return { word: term.word as string, meaning: term.meaning as string, namesThingSlug, namesStatus, isRole: term.isRole === true, otherNames };
}

function isWordAndMeaning(term: PlainObject): boolean {
	return isFilledText(term.word) && typeof term.meaning === 'string';
}
