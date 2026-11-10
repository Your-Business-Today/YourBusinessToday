import { boardMinutesRefusals, isFittingMinutesWords } from './boardroomMinutesRules';
import { readTrimmed } from './boardPaperInput';

/** The minutes as the minute-taker's Claude wrote them, checked against their column, or why they do not fit. */
export function validateMinutesWords(input: Record<string, unknown>): string | { words: string } {
	const words = readTrimmed(input, 'words');
	if (!isFittingMinutesWords(words)) return boardMinutesRefusals.wordsMissing;
	return { words };
}
