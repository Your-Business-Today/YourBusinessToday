import { boardBriefRefusals, isFittingBriefPart } from './boardroomBriefRules';
import { isGiven, readTrimmed, validateItemNumber } from './boardPaperInput';
import type { BoardBriefDraft } from './boardroomBrief';

type OptionalPart = 'mayShare' | 'mustNotShare' | 'mustComeBack';

const optionalPartRefusals: Record<OptionalPart, string> = {
	mayShare: boardBriefRefusals.mayShareTooLong,
	mustNotShare: boardBriefRefusals.mustNotShareTooLong,
	mustComeBack: boardBriefRefusals.mustComeBackTooLong
};

const optionalParts = Object.keys(optionalPartRefusals) as OptionalPart[];

function firstOverlongPart(input: Record<string, unknown>): OptionalPart | undefined {
	return optionalParts.find((part) => !isFittingBriefPart(readTrimmed(input, part)));
}

function optionalText(input: Record<string, unknown>, part: OptionalPart): string | null {
	const text = readTrimmed(input, part);
	if (text === '') return null;
	return text;
}

/** A brief as given, checked against the columns it goes to, or the sentence naming what does not fit. */
export function validateBoardroomBrief(input: Record<string, unknown>): BoardBriefDraft | string {
	const itemNumber = validateItemNumber(input.itemNumber);
	if (itemNumber === null) return boardBriefRefusals.itemNumberNotANumber;
	const position = readTrimmed(input, 'position');
	if (position === '' || !isFittingBriefPart(position)) return boardBriefRefusals.positionMissing;
	const overlong = firstOverlongPart(input);
	if (overlong !== undefined) return optionalPartRefusals[overlong];
	return {
		itemNumber,
		position,
		mayShare: optionalText(input, 'mayShare'),
		mustNotShare: optionalText(input, 'mustNotShare'),
		mustComeBack: optionalText(input, 'mustComeBack')
	};
}

/** Which version of a brief is asked for: its number, null for the latest, or the refusal when it is not a whole number from 1. */
export function validateBriefVersion(input: Record<string, unknown>): number | null | string {
	if (!isGiven(input, 'version')) return null;
	return validateItemNumber(input.version) ?? boardBriefRefusals.versionNotANumber;
}
