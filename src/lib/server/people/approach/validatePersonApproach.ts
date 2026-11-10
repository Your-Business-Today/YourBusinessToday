import { personApproachLimits, type PersonApproach } from '$lib/data/personApproachRules';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';

const { longestOpeningMessage, longestCallPlan } = personApproachLimits;

export const openingMessageRefusal = `The openingMessage is 1 to ${longestOpeningMessage} characters: the first email or message to them.`;
export const callPlanRefusal = `The callPlan is 1 to ${longestCallPlan} characters: the reason for the call, the questions, the objection and the ask.`;

/** The approach as given, each value checked against the note it is written to, or a sentence naming what does not fit. */
export function validatePersonApproach(input: Record<string, unknown>): PersonApproach | string {
	const personId = trimmedText(input.personId);
	const idRefusal = validateRecordId('personId', personId);
	if (idRefusal !== null) return idRefusal;
	const openingMessage = trimmedText(input.openingMessage);
	if (!fitsWithin(openingMessage, longestOpeningMessage)) return openingMessageRefusal;
	const callPlan = trimmedText(input.callPlan);
	if (!fitsWithin(callPlan, longestCallPlan)) return callPlanRefusal;
	return { personId, openingMessage, callPlan };
}

function fitsWithin(text: string, longest: number): boolean {
	return text !== '' && text.length <= longest;
}
