import { wordsOf } from './wordMatch';

export const similarityLimits = { leastSharedWords: 2, leastSharedShare: 0.5, mostShown: 5 } as const;

const commonWords = new Set([
	'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'onto', 'upon', 'when', 'what', 'who',
	'can', 'are', 'was', 'were', 'has', 'have', 'had', 'its', 'our', 'your', 'their', 'they', 'them',
	'you', 'his', 'her', 'she', 'him', 'not', 'but', 'all', 'any', 'each', 'every', 'one', 'out', 'how',
	'why', 'want', 'wants', 'need', 'needs', 'see', 'get', 'set', 'use', 'make', 'task', 'tasks',
	'someone', 'user', 'should', 'would', 'could', 'will', 'than', 'then', 'there', 'here', 'also',
	'only', 'about', 'after', 'before', 'which', 'where', 'own', 'new', 'like', 'just', 'more', 'some',
	'such', 'other', 'others', 'over', 'under', 'through', 'without', 'within', 'between', 'because',
	'while', 'still', 'does', 'did', 'done', 'being', 'been', 'way', 'very', 'much', 'many', 'most',
	'same', 'know', 'able', 'let', 'too', 'yet', 'now', 'ever', 'never', 'always', 'already', 'again',
	'instead', 'rather', 'either', 'neither', 'both', 'these', 'those', 'myself', 'itself'
]);

/** The distinct words of a text that carry its meaning, in lower case. */
export function meaningfulWords(text: string): string[] {
	const words = wordsOf(text).map((word) => word.toLowerCase());
	return [...new Set(words)].filter((word) => !commonWords.has(word));
}

export function sharedWords(first: string[], second: string[]): string[] {
	const secondWords = new Set(second);
	return first.filter((word) => secondWords.has(word));
}

/** Two texts look alike when they share at least two meaningful words, and at least half the words of the shorter. */
export function looksAlike(first: string[], second: string[]): boolean {
	const sharedCount = sharedWords(first, second).length;
	const shorterCount = Math.min(first.length, second.length);
	const hasEnoughShared = sharedCount >= similarityLimits.leastSharedWords;
	return hasEnoughShared && sharedCount >= shorterCount * similarityLimits.leastSharedShare;
}

export type Scored<T> = { item: T; shared: string[]; sharedCount: number };

/** The items whose text looks like the given one, most shared words first, at most a handful. */
export function mostSimilar<T>(text: string, items: T[], textOf: (item: T) => string): Scored<T>[] {
	const words = meaningfulWords(text);
	return items
		.map((item) => ({ item, words: meaningfulWords(textOf(item)) }))
		.filter((candidate) => looksAlike(words, candidate.words))
		.map((candidate) => scoredItem(candidate.item, sharedWords(words, candidate.words)))
		.sort((first, second) => second.sharedCount - first.sharedCount)
		.slice(0, similarityLimits.mostShown);
}

function scoredItem<T>(item: T, shared: string[]): Scored<T> {
	return { item, shared, sharedCount: shared.length };
}
