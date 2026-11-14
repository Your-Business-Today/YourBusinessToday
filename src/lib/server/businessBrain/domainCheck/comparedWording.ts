/** The small words that join a title's words and change nothing it names. */
const joiningWords = new Set(['a', 'an', 'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'with']);

/** Endings that look plural and are not: business, status, analysis. */
const singularEndings = ['ss', 'us', 'is'];

/** Endings a plural takes es after: churches, wishes, classes, boxes, statuses. */
const esEndings = ['ches', 'shes', 'sses', 'xes', 'uses'];

const shortestPlural = 4;

const wordBreaks = /[^a-z0-9]+/;

const number = /^[0-9]+$/;

/** A word in the singular, as near as spelling tells: quotes to quote, enquiries to enquiry, boxes to box. */
export function singularOf(word: string): string {
	const isTooShort = word.length < shortestPlural;
	const isSingularAlready = singularEndings.some((ending) => word.endsWith(ending));
	if (isTooShort || isSingularAlready || !word.endsWith('s')) return word;
	if (word.endsWith('ies')) return `${word.slice(0, -3)}y`;
	const isEsPlural = esEndings.some((ending) => word.endsWith(ending));
	return word.slice(0, isEsPlural ? -2 : -1);
}

/** A title or a slug as near-duplicates are compared: lower case, numbers and joining words left out, each word singular, in alphabetical order. */
export function comparedWordingOf(text: string): string {
	const words = text
		.toLowerCase()
		.split(wordBreaks)
		.filter((word) => word.length > 0 && !joiningWords.has(word) && !number.test(word));
	return words.map(singularOf).sort().join(' ');
}
