import { businessBrainLimits, type BusinessBrainRevisionGiven } from '$lib/data/businessBrainRules';
import { bodyRefusal, isPageKind, kindRefusal, lengthRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validateBusinessBrainSource } from './validateBusinessBrainSource';
import { validateRecordId } from '$lib/data/isUuid';

const { longestTitle, longestSummary } = businessBrainLimits;

/** A revision as given, every value checked against its column, or a sentence naming the one that does not fit. */
export function validateBusinessBrainRevision(input: Record<string, unknown>): BusinessBrainRevisionGiven | string {
	const pageId = trimmedText(input.pageId);
	const idRefusal = validateRecordId('pageId', pageId);
	if (idRefusal !== null) return idRefusal;
	const kind = trimmedText(input.kind);
	const isKindGiven = kind !== '';
	if (isKindGiven && !isPageKind(kind)) return kindRefusal;
	const title = trimmedText(input.title);
	const isSummaryGiven = input.summary !== undefined;
	const summary = trimmedText(input.summary);
	const body = trimmedText(input.body);
	const textRefusal = lengthRefusal('title', title, longestTitle, true) ?? lengthRefusal('summary', summary, longestSummary, false);
	if (textRefusal !== null) return textRefusal;
	if (body === '') return bodyRefusal;
	const source = validateBusinessBrainSource(input);
	if (typeof source === 'string') return source;
	return { pageId, kind: isKindGiven ? kind : null, title, summary: isSummaryGiven ? summary : null, body, source };
}
