import { longestMessageBody } from '$lib/server/conversations/postMessage';
import { parseTurnOutcome, turnOutcomeOrder, turnOutcomes, wordlessOutcomes, type TurnOutcome } from './turnOutcome';
import { readDay } from '$lib/data/days';
import { readOptionalText } from '$lib/server/mcp/actionTypes';
import { testResultLimits } from '$lib/data/testResult';

/** The person's answer to one item, as answer_turn records it. */
export type TurnAnswer = {
	itemKey: string;
	outcome: TurnOutcome;
	text: string | null;
	fault: string | null;
	untilDay: string | null;
};

/** The longest item key, as agent_conversations and agent_snoozes hold it. */
export const longestItemKey = 200;

/** The answer as sent, or a refusal naming the field that does not fit. Nothing is repaired. */
export function validateTurnAnswer(input: Record<string, unknown>, today: string): TurnAnswer | string {
	const itemKey = readOptionalText(input, 'itemKey');
	if (itemKey === null) return 'itemKey is the key next_turn gave for the item. Nothing was recorded.';
	if (itemKey.length > longestItemKey) return `itemKey is at most ${longestItemKey} characters.`;
	const outcome = parseTurnOutcome(readOptionalText(input, 'outcome'));
	if (outcome === null) return `outcome is one of ${turnOutcomeOrder.join(', ')}.`;
	const text = readOptionalText(input, 'text');
	const textRefusal = textRefusalFor(outcome, text);
	if (textRefusal !== null) return textRefusal;
	const fault = readOptionalText(input, 'fault');
	const faultRefusal = faultRefusalFor(outcome, fault);
	if (faultRefusal !== null) return faultRefusal;
	const untilDay = readDay(input.untilDay);
	if (untilDay === undefined) return 'untilDay is a day written YYYY-MM-DD.';
	const isUntilPast = untilDay !== null && untilDay <= today;
	if (isUntilPast) return `untilDay is a day after today (${today}).`;
	return { itemKey, outcome, text, fault, untilDay };
}

function textRefusalFor(outcome: TurnOutcome, text: string | null): string | null {
	const isWordless = wordlessOutcomes.includes(outcome);
	if (text === null && !isWordless) return `text is what the person said, and ${outcome} needs it.`;
	if (text !== null && text.length > longestMessageBody) return `text is at most ${longestMessageBody} characters.`;
	return null;
}

function faultRefusalFor(outcome: TurnOutcome, fault: string | null): string | null {
	const isFailure = outcome === turnOutcomes.failed;
	if (isFailure && fault === null) return 'fault says what is wrong, and a failed test needs it.';
	if (!isFailure && fault !== null) return 'fault is for a failed test only.';
	if (fault !== null && fault.length > testResultLimits.longestFault) {
		return `fault is at most ${testResultLimits.longestFault} characters.`;
	}
	return null;
}
