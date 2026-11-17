import { trimmedText } from '$lib/data/trimmedText';
import {
	isWatchedKind,
	watchedKinds,
	watchedValueHints,
	watchedValuePatterns,
	watchListLimits,
	type WatchedKind,
	type WatchedThingGiven
} from '$lib/data/news/watchListRules';

const { longestValue, longestLabel } = watchListLimits;

export const watchedThingRefusals = {
	kind: `The kind is one of ${watchedKinds.join(', ')}.`,
	value: `The value is 1 to ${longestValue} characters: the thing watched.`,
	label: `The label is at most ${longestLabel} characters: what the thing is called.`
} as const;

/** The thing as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateWatchedThing(input: Record<string, unknown>): WatchedThingGiven | string {
	const kind = trimmedText(input.kind);
	if (!isWatchedKind(kind)) return watchedThingRefusals.kind;
	const value = trimmedText(input.value);
	if (value === '' || value.length > longestValue) return watchedThingRefusals.value;
	if (!fitsTheKind(kind, value)) return watchedValueHints[kind];
	const label = trimmedText(input.label);
	if (label.length > longestLabel) return watchedThingRefusals.label;
	return { kind, value, label };
}

function fitsTheKind(kind: WatchedKind, value: string): boolean {
	const pattern = watchedValuePatterns[kind];
	if (pattern === undefined) return true;
	return pattern.test(value);
}
