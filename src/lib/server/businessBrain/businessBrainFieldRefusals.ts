import { businessBrainLimits, businessBrainPatterns } from '$lib/data/businessBrainRules';

const { longestKind, longestSlug } = businessBrainLimits;

/** Why a text does not fit its column, or null when it does; a required text must not be blank. */
export function lengthRefusal(fieldName: string, text: string, longest: number, isRequired: boolean): string | null {
	const isMissing = isRequired && text === '';
	if (isMissing) return `The ${fieldName} is required, at most ${longest} characters.`;
	if (text.length > longest) return `The ${fieldName} is at most ${longest} characters; this one is ${text.length}.`;
	return null;
}

export const kindRefusal =
	`The kind says what the page is, in lower-case words joined by underscores, at most ${longestKind} ` +
	'characters: person, client, rule, process, fact, price, supplier.';

export const slugRefusal =
	`The slug is lower-case letters and digits joined by single hyphens, at most ${longestSlug} characters, ` +
	'such as weekly-cash-flow. Give one when the title has no letters or digits to make it from.';

export const bodyRefusal = 'The body is the text of the page, what the source says about its one subject; it is required.';

export function isPageKind(kind: string): boolean {
	return kind.length <= longestKind && businessBrainPatterns.kind.test(kind);
}

export function isPageSlug(slug: string): boolean {
	return slug.length <= longestSlug && businessBrainPatterns.slug.test(slug);
}

const diacritics = /[̀-ͯ]/g;
const anythingButLettersAndDigits = /[^a-z0-9]+/g;
const hyphensAtTheEnds = /^-+|-+$/g;

/** The slug a page is filed under when none is given: its title in lower-case words joined by hyphens. */
export function slugFromTitle(title: string): string {
	const plainLetters = title.normalize('NFKD').replace(diacritics, '').toLowerCase();
	const hyphenated = plainLetters.replace(anythingButLettersAndDigits, '-').replace(hyphensAtTheEnds, '');
	return hyphenated.slice(0, longestSlug).replace(hyphensAtTheEnds, '');
}
