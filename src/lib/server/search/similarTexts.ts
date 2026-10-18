import { distinctWords, looksAlike, meaningfulWords, saysTheSame, sharedWords, similarityLimits } from './similarWords';

/** A text as it is compared: every distinct word of it, and the ones that carry its meaning. */
export type ComparedText = { words: string[]; meaningful: string[] };

export type Scored<T> = { item: T; shared: string[]; sharedCount: number };

export function comparedTextOf(text: string): ComparedText {
	return { words: distinctWords(text), meaningful: meaningfulWords(text) };
}

/**
 * The words two texts have in common when they say the same thing or look alike, else null. They say the
 * same when their meaningful words, or all their words, are the very same; they look alike when they share
 * enough of the words that carry their meaning.
 */
export function wordsInCommon(first: ComparedText, second: ComparedText): string[] | null {
	if (saysTheSame(first.meaningful, second.meaningful)) return first.meaningful;
	if (saysTheSame(first.words, second.words)) return first.words;
	if (looksAlike(first.meaningful, second.meaningful)) return sharedWords(first.meaningful, second.meaningful);
	return null;
}

/** The words to look for when finding texts like these: each one's meaningful words, or all of its words when it has none. */
export function wordsToSearch(texts: string[]): string[] {
	return [...new Set(texts.flatMap(wordsToSearchOne))];
}

/** The items any of whose texts say the same as, or look like, any of the given texts; the most alike first, and at most a handful. */
export function mostSimilar<T>(texts: string[], items: T[], textsOf: (item: T) => string[]): Scored<T>[] {
	const compared = texts.map(comparedTextOf);
	return items
		.map((item) => ({ item, shared: largestInCommon(compared, textsOf(item).map(comparedTextOf)) }))
		.filter((pair): pair is { item: T; shared: string[] } => pair.shared !== null)
		.map(({ item, shared }) => scoredItem(item, shared))
		.sort((first, second) => second.sharedCount - first.sharedCount)
		.slice(0, similarityLimits.mostShown);
}

function wordsToSearchOne(text: string): string[] {
	const meaningful = meaningfulWords(text);
	if (meaningful.length !== 0) return meaningful;
	return distinctWords(text);
}

/** The largest set of words any of the first texts has in common with any of the second, or null when none have any. */
function largestInCommon(firsts: ComparedText[], seconds: ComparedText[]): string[] | null {
	const inCommon = firsts.flatMap((first) => seconds.map((second) => wordsInCommon(first, second)));
	const found = inCommon.filter((shared): shared is string[] => shared !== null);
	const largestFirst = found.sort((first, second) => second.length - first.length);
	return largestFirst[0] ?? null;
}

function scoredItem<T>(item: T, shared: string[]): Scored<T> {
	return { item, shared, sharedCount: shared.length };
}
