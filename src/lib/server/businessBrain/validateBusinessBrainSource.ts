import { businessBrainLimits, type BusinessBrainSourceGiven } from '$lib/data/businessBrainRules';
import { lengthRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';

const { longestSourceTitle, longestOrigin, longestSourceSummary } = businessBrainLimits;

export const sourceRefusal =
	'Name where this came from: sourceTitle (what you read it in) with sourceOrigin (where it can be found), ' +
	'or sourceId for a source filed before. Give one or the other, not both.';

/** The source as given, checked against its columns, or a sentence naming what does not fit. */
export function validateBusinessBrainSource(input: Record<string, unknown>): BusinessBrainSourceGiven | string {
	const sourceId = trimmedText(input.sourceId);
	const title = trimmedText(input.sourceTitle);
	const isEarlierSource = sourceId !== '';
	if (isEarlierSource && title !== '') return sourceRefusal;
	if (isEarlierSource) return validateRecordId('sourceId', sourceId) ?? { sourceId };
	if (title === '') return sourceRefusal;
	return validateNewSource(title, input);
}

function validateNewSource(title: string, input: Record<string, unknown>): BusinessBrainSourceGiven | string {
	const origin = trimmedText(input.sourceOrigin);
	const summary = trimmedText(input.sourceSummary);
	const refusal =
		lengthRefusal('sourceTitle', title, longestSourceTitle, true) ??
		lengthRefusal('sourceOrigin', origin, longestOrigin, false) ??
		lengthRefusal('sourceSummary', summary, longestSourceSummary, false);
	if (refusal !== null) return refusal;
	return { title, origin, summary };
}
