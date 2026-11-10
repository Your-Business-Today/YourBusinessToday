import { boardRoomLimits, boardRoomRefusals } from './boardroomRoomRules';
import { isGiven, readTrimmed, validateItemNumber } from './boardPaperInput';
import { contributionStances, stances, type ContributionStance } from './boardroomRoom';
import { boardDecisionRefusals } from './boardroomDecisionRules';
import { isUuid } from './isUuid';

/** What a director's Claude says on an item, as given: numbers are the ones read_board_item gives now. */
export type ContributionDraft = {
	itemNumber: number;
	stance: ContributionStance;
	words: string;
	wording: string | null;
	proposalNumber: number | null;
	correctsNumber: number | null;
	replacesDecisionId: string | null;
};

function readStance(value: unknown): ContributionStance | null {
	return contributionStances.find((stance) => stance === value) ?? null;
}

function optionalNumber(input: Record<string, unknown>, field: string, refusal: string): number | null | string {
	if (!isGiven(input, field)) return null;
	return validateItemNumber(input[field]) ?? refusal;
}

function validateWording(input: Record<string, unknown>, stance: ContributionStance): string | null | { refusal: string } {
	const wording = readTrimmed(input, 'wording');
	const isProposing = stance === stances.proposes;
	if (!isProposing) return wording === '' ? null : { refusal: boardRoomRefusals.wordingWithoutProposal };
	if (wording === '' || wording.length > boardRoomLimits.longestWording) return { refusal: boardRoomRefusals.wordingMissing };
	return wording;
}

function validateProposalNumber(input: Record<string, unknown>, stance: ContributionStance): number | null | string {
	const proposalNumber = optionalNumber(input, 'proposalNumber', boardRoomRefusals.proposalNumberNotANumber);
	if (proposalNumber === null && stance === stances.supports) return boardRoomRefusals.proposalNumberMissing;
	return proposalNumber;
}

/** The earlier decision a proposal replaces, by its id, or null; only a proposal names one. */
function validateReplaces(input: Record<string, unknown>, stance: ContributionStance): string | null | { refusal: string } {
	const replaces = readTrimmed(input, 'replacesDecision');
	if (replaces === '') return null;
	if (stance !== stances.proposes) return { refusal: boardDecisionRefusals.replacesOnlyWithProposal };
	return isUuid(replaces) ? replaces : { refusal: boardDecisionRefusals.replacesNotAnId };
}

/** A contribution as given, checked against the columns it goes to, or the sentence naming what does not fit. */
export function validateBoardContribution(input: Record<string, unknown>): ContributionDraft | string {
	const itemNumber = validateItemNumber(input.itemNumber);
	if (itemNumber === null) return boardRoomRefusals.itemNumberNotANumber;
	const stance = readStance(input.stance);
	if (stance === null) return boardRoomRefusals.stanceUnknown;
	const words = readTrimmed(input, 'words');
	if (words === '' || words.length > boardRoomLimits.longestWords) return boardRoomRefusals.wordsMissing;
	const wording = validateWording(input, stance);
	if (typeof wording === 'object' && wording !== null) return wording.refusal;
	const proposalNumber = validateProposalNumber(input, stance);
	if (typeof proposalNumber === 'string') return proposalNumber;
	const correctsNumber = optionalNumber(input, 'corrects', boardRoomRefusals.correctsNotANumber);
	if (typeof correctsNumber === 'string') return correctsNumber;
	const replacesDecisionId = validateReplaces(input, stance);
	if (typeof replacesDecisionId === 'object' && replacesDecisionId !== null) return replacesDecisionId.refusal;
	return { itemNumber, stance, words, wording, proposalNumber, correctsNumber, replacesDecisionId };
}

/** How many rounds the room talks each item through: as given, the usual number when left out, or the refusal. */
export function validateRoundsLimit(input: Record<string, unknown>): number | string {
	if (!isGiven(input, 'roundsLimit')) return boardRoomLimits.usualRounds;
	const rounds = validateItemNumber(input.roundsLimit);
	if (rounds === null || rounds > boardRoomLimits.mostRounds) return boardRoomRefusals.roundsNotANumber;
	return rounds;
}
