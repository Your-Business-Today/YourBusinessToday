import { boardDecisionRefusals, isFittingReason } from './boardroomDecisionRules';
import { allDecisionAnswers, type DecisionAnswerKind } from './boardroomDecision';
import { readTrimmed, validateItemNumber } from './boardPaperInput';

/** A director's own answer to the decision on an item, as given: the item by its number on the agenda now. */
export type DecisionAnswerDraft = { itemNumber: number; answer: DecisionAnswerKind; reason: string | null };

/** An answer as given, checked against the columns it goes to, or the sentence naming what does not fit. */
export function validateDecisionAnswer(input: Record<string, unknown>): DecisionAnswerDraft | string {
	const itemNumber = validateItemNumber(input.itemNumber);
	if (itemNumber === null) return boardDecisionRefusals.itemNumberNotANumber;
	const answer = allDecisionAnswers.find((known) => known === input.answer);
	if (answer === undefined) return boardDecisionRefusals.answerUnknown;
	const reason = readTrimmed(input, 'reason');
	if (!isFittingReason(reason)) return boardDecisionRefusals.reasonTooLong;
	return { itemNumber, answer, reason: reason === '' ? null : reason };
}
