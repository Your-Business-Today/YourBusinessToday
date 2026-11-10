import {
	businessBrainLimits,
	businessBrainPartKinds,
	isBusinessBrainPartKind,
	type BusinessBrainPageGiven
} from '$lib/data/businessBrainRules';
import { bodyRefusal, isPageKind, isPageSlug, kindRefusal, lengthRefusal, slugFromTitle, slugRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validateBusinessBrainSource } from './validateBusinessBrainSource';

const { longestTitle, longestSummary } = businessBrainLimits;

export const partRefusal = `The part is the part of the business the page belongs to: one of ${businessBrainPartKinds.join(', ')}.`;

/** A new page as given, every value checked against its column, or a sentence naming the one that does not fit. */
export function validateBusinessBrainPage(input: Record<string, unknown>): BusinessBrainPageGiven | string {
	const part = trimmedText(input.part);
	if (!isBusinessBrainPartKind(part)) return partRefusal;
	const kind = trimmedText(input.kind);
	if (!isPageKind(kind)) return kindRefusal;
	const title = trimmedText(input.title);
	const summary = trimmedText(input.summary);
	const body = trimmedText(input.body);
	const textRefusal = lengthRefusal('title', title, longestTitle, true) ?? lengthRefusal('summary', summary, longestSummary, false);
	if (textRefusal !== null) return textRefusal;
	if (body === '') return bodyRefusal;
	const slug = trimmedText(input.slug) || slugFromTitle(title);
	if (!isPageSlug(slug)) return slugRefusal;
	const source = validateBusinessBrainSource(input);
	if (typeof source === 'string') return source;
	return { part, kind, slug, title, summary, body, source };
}
