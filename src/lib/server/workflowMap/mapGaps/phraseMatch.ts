import { phraseMeaningOf, wordingOf, type MapVocabulary, type PhraseMeaning } from '$lib/data/workflowMap/phraseInDomain';

/** Whether what one station offers is what another needs. */
export type PhraseMatch = (needed: string, offered: string) => boolean;

/** Phrases match when they are worded alike, or name the same thing through the glossary, in the status needed when one is. */
export function phraseMatchOf(vocabulary: MapVocabulary): PhraseMatch {
	return (needed, offered) => {
		const isWordedAlike = wordingOf(needed) === wordingOf(offered);
		if (isWordedAlike) return true;
		const neededMeaning = phraseMeaningOf(vocabulary, needed);
		const offeredMeaning = phraseMeaningOf(vocabulary, offered);
		return isSameThingInStatus(neededMeaning, offeredMeaning);
	};
}

function isSameThingInStatus(needed: PhraseMeaning | null, offered: PhraseMeaning | null): boolean {
	if (needed === null || offered === null || needed.thingSlug === null) return false;
	if (needed.thingSlug !== offered.thingSlug) return false;
	if (needed.status === null) return true;
	const neededStatus = wordingOf(needed.status);
	const offeredStatus = wordingOf(offered.status ?? '');
	return neededStatus === offeredStatus;
}
