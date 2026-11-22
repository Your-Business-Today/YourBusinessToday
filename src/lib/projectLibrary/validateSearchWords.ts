import { LibrarySearchLimits } from './libraryMatch';
import { checkRequiredWords, type FieldCheck } from '$lib/data/fieldChecks';

const { longestWords } = LibrarySearchLimits;

export const searchWordsRefusal = `words are what to look for in the project's videos and documents: required, at most ${longestWords} characters`;

/** The words to search for, trimmed, or the refusal that names their limit. */
export function checkSearchWords(value: unknown): FieldCheck<string> {
	return checkRequiredWords(value, longestWords, searchWordsRefusal);
}
