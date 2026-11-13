import type { DomainTermFact } from '$lib/data/businessBrainDomain';

/** A Domain thing as the map's phrases can name it: by its title or by its slug. */
export type VocabularyThing = { slug: string; title: string };

/** What the map's phrases are looked up in: the domain's things and the glossary's words. */
export type MapVocabulary = { things: VocabularyThing[]; words: DomainTermFact[] };

/** What a phrase on the map is in the domain: the thing it names and in which status, or whether it is a role. */
export type PhraseMeaning = { thingSlug: string | null; status: string | null; isRole: boolean };

export const emptyVocabulary: MapVocabulary = { things: [], words: [] };

/** Whether the domain holds anything a phrase could be found in. */
export function isVocabularyFiled({ things, words }: MapVocabulary): boolean {
	return things.length + words.length > 0;
}

/** A phrase's meaning, ignoring case: a thing's title or slug first, else a word or one of its other names; null when neither. */
export function phraseMeaningOf({ things, words }: MapVocabulary, phrase: string): PhraseMeaning | null {
	const wording = wordingOf(phrase);
	const thing = things.find(({ slug, title }) => wordingOf(title) === wording || wordingOf(slug) === wording);
	if (thing !== undefined) return { thingSlug: thing.slug, status: null, isRole: false };
	const word = words.find((term) => isWordFor(term, wording));
	if (word === undefined) return null;
	return { thingSlug: word.namesThingSlug, status: word.namesStatus, isRole: word.isRole };
}

/** Whether the glossary or the things hold the phrase. */
export function isPhraseInDomain(vocabulary: MapVocabulary, phrase: string): boolean {
	return phraseMeaningOf(vocabulary, phrase) !== null;
}

/** Whether a word, by itself or by one of its other names, is the phrase's wording. */
export function isWordFor({ word, otherNames }: DomainTermFact, wording: string): boolean {
	return [word, ...otherNames].some((name) => wordingOf(name) === wording);
}

/** A phrase as it is compared: trimmed and in lower case. */
export function wordingOf(phrase: string): string {
	return phrase.trim().toLowerCase();
}
