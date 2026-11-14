import { trimmedText } from '$lib/data/trimmedText';

/** A list of texts as given, each once and each fitting, at most so many; none when nothing is given, null when it does not fit. */
export function validateTextList(given: unknown, most: number, isFitting: (text: string) => boolean): string[] | null {
	if (given === undefined) return [];
	if (!Array.isArray(given) || given.length > most) return null;
	const texts = given.map(trimmedText);
	const isEachOnce = new Set(texts).size === texts.length;
	return isEachOnce && texts.every(isFitting) ? texts : null;
}
