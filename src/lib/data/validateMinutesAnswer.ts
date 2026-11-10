import { boardMinutesRefusals, isFittingChangeWords } from './boardroomMinutesRules';
import { allMinutesAnswers, minutesAnswers, type MinutesAnswerKind } from './boardroomMinutes';
import { readTrimmed, validateItemNumber } from './boardPaperInput';

/** A director's own answer to a version of the minutes, as given: the version by its number. */
export type MinutesAnswerDraft = { version: number; answer: MinutesAnswerKind; changeWords: string | null };

function changeWordsOf(answer: MinutesAnswerKind, changeWords: string): string | null | undefined {
	const isAskingForChange = answer === minutesAnswers.asksForChange;
	if (!isAskingForChange) return changeWords === '' ? null : undefined;
	return isFittingChangeWords(changeWords) ? changeWords : undefined;
}

/** An answer to the minutes as given, checked against the columns it goes to, or the sentence naming what does not fit. */
export function validateMinutesAnswer(input: Record<string, unknown>): MinutesAnswerDraft | string {
	const version = validateItemNumber(input.version);
	if (version === null) return boardMinutesRefusals.versionNotANumber;
	const answer = allMinutesAnswers.find((known) => known === input.answer);
	if (answer === undefined) return boardMinutesRefusals.answerUnknown;
	const changeWords = changeWordsOf(answer, readTrimmed(input, 'changeWords'));
	if (changeWords !== undefined) return { version, answer, changeWords };
	const isAskingForChange = answer === minutesAnswers.asksForChange;
	return isAskingForChange ? boardMinutesRefusals.changeWordsMissing : boardMinutesRefusals.changeWordsWithApproval;
}
