import { companyContextLimits as limits, partKeyShape } from '$lib/data/companyContext/companyContextLimits';
import { reviewStates } from '$lib/data/companyContext/companyContext';
import { isRefused, readChoice, readOptionalText } from './contextText';
import { textOf, type Refusal } from '$lib/server/portal/portalFormReading';
import type { ContextPart } from '$lib/data/companyContext/companyContext';

/** A client's mark on one part of the version they were shown: right, or not right with what is wrong. */
export type PartMark = {
	versionNumber: number;
	partKey: string;
	reviewState: Exclude<ContextPart['reviewState'], typeof reviewStates.notChecked>;
	whatIsWrong: string | null;
};

export const partMarkFields = {
	versionNumber: 'versionNumber',
	partKey: 'partKey',
	reviewState: 'reviewState',
	whatIsWrong: 'whatIsWrong'
} as const;

const markChoices = [reviewStates.right, reviewStates.notRight] as const;
const wholeNumberShape = /^[0-9]+$/;
const whatIsWrongField = 'What is wrong';

/** Reads a mark from the portal's form and refuses the first value that does not fit its column. */
export function validatePartMark(formData: FormData): PartMark | Refusal {
	return validatePartMarkValues({
		versionNumber: textOf(formData, partMarkFields.versionNumber),
		partKey: textOf(formData, partMarkFields.partKey),
		reviewState: formData.get(partMarkFields.reviewState),
		whatIsWrong: formData.get(partMarkFields.whatIsWrong)
	});
}

/** The same reading from the values a connector call gives, so the two doors keep one check. */
export function validatePartMarkValues(values: Record<string, unknown>): PartMark | Refusal {
	const versionNumber = readVersionNumber(String(values.versionNumber ?? '').trim());
	if (isRefused(versionNumber)) return versionNumber;
	const partKey = readPartKey(String(values.partKey ?? '').trim());
	if (isRefused(partKey)) return partKey;
	const reviewState = readChoice(values.reviewState, markChoices, 'The mark');
	if (isRefused(reviewState)) return reviewState;
	const rule = { field: whatIsWrongField, limit: limits.whatIsWrongLength };
	const whatIsWrong = readOptionalText(values.whatIsWrong, rule);
	if (isRefused(whatIsWrong)) return whatIsWrong;
	const isNotRight = reviewState === reviewStates.notRight;
	if (isNotRight && whatIsWrong === null) return { refusal: 'Say what is wrong, so your Claude can put it right.' };
	if (!isNotRight && whatIsWrong !== null)
		return { refusal: 'What is wrong is kept only with Not right: clear it, or press Not right.' };
	return { versionNumber, partKey, reviewState, whatIsWrong };
}

export function readVersionNumber(text: string): number | Refusal {
	const versionNumber = Number(text);
	const isWholeNumber = wholeNumberShape.test(text);
	const isInRange = versionNumber >= 1 && versionNumber <= limits.largestVersionNumber;
	if (isWholeNumber && isInRange) return versionNumber;
	return { refusal: `The version must be a whole number from 1 to ${limits.largestVersionNumber}.` };
}

function readPartKey(text: string): string | Refusal {
	if (text === '') return { refusal: 'Pick the part you are marking.' };
	if (text.length > limits.keyLength) return { refusal: `The part's key is longer than ${limits.keyLength} characters.` };
	if (!partKeyShape.test(text)) return { refusal: "The part's key must be lower-case words joined by hyphens." };
	return text;
}
