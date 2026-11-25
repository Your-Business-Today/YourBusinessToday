import { contractPackLimits as limits } from '$lib/data/contractPackRules';
import type { BlankValues } from './fillContractBlanks';

/** The blanks written into a pack, each label and value within its limit, or why not, naming the blank. */
export function validateWrittenValues(given: unknown): BlankValues | string {
	if (given === undefined || given === null) return {};
	if (typeof given !== 'object' || Array.isArray(given)) return 'The values are an object of blank labels, each with the text it is filled with.';
	const entries = Object.entries(given as Record<string, unknown>);
	const refusal = entries.map(([label, value]) => entryRefusal(label, value)).find((reason) => reason !== null);
	if (refusal !== undefined) return refusal;
	return Object.fromEntries(entries.map(([label, value]) => [label.trim(), String(value).trim()]));
}

function entryRefusal(label: string, value: unknown): string | null {
	const trimmedLabel = label.trim();
	const isLabelWithinLimits = trimmedLabel !== '' && trimmedLabel.length <= limits.longestBlankLabel;
	if (!isLabelWithinLimits) {
		return `A blank's label is 1 to ${limits.longestBlankLabel} characters, as it stands in its brackets.`;
	}
	if (typeof value !== 'string') return `The value for [${trimmedLabel}] is text.`;
	const valueLength = value.trim().length;
	if (valueLength > limits.longestBlankValue) {
		return `The value for [${trimmedLabel}] is ${valueLength} characters; at most ${limits.longestBlankValue}.`;
	}
	return null;
}
