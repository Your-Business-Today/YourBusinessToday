import { describe, expect, it } from 'vitest';
import { validateBoardContribution, validateRoundsLimit } from './validateBoardContribution';
import { boardRoomLimits, boardRoomRefusals } from './boardroomRoomRules';

const proposal = { itemNumber: 1, stance: 'proposes', words: 'We should approve them.', wording: 'Approve the accounts.' };

describe('what a Claude says is checked against its columns, and refused rather than repaired', () => {
	it('takes a proposal with its wording, and a support naming the wording it supports', () => {
		expect(validateBoardContribution(proposal)).toEqual({ ...proposal, proposalNumber: null, correctsNumber: null, replacesDecisionId: null });
		const support = validateBoardContribution({ itemNumber: 1, stance: 'supports', words: 'Agreed.', proposalNumber: 1 });
		expect(support).toMatchObject({ stance: 'supports', wording: null, proposalNumber: 1 });
	});

	it('refuses a stance it does not know, words missing or too long, and a wording without a proposal', () => {
		expect(validateBoardContribution({ ...proposal, stance: 'decides' })).toBe(boardRoomRefusals.stanceUnknown);
		expect(validateBoardContribution({ ...proposal, words: ' ' })).toBe(boardRoomRefusals.wordsMissing);
		const tooLong = 'x'.repeat(boardRoomLimits.longestWords + 1);
		expect(validateBoardContribution({ ...proposal, words: tooLong })).toBe(boardRoomRefusals.wordsMissing);
		expect(validateBoardContribution({ ...proposal, stance: 'comments' })).toBe(boardRoomRefusals.wordingWithoutProposal);
		expect(validateBoardContribution({ ...proposal, wording: '' })).toBe(boardRoomRefusals.wordingMissing);
	});

	it('refuses a support that names no wording, and numbers that are not whole numbers from 1', () => {
		expect(validateBoardContribution({ itemNumber: 1, stance: 'supports', words: 'Yes.' })).toBe(boardRoomRefusals.proposalNumberMissing);
		expect(validateBoardContribution({ ...proposal, itemNumber: 0 })).toBe(boardRoomRefusals.itemNumberNotANumber);
		expect(validateBoardContribution({ ...proposal, corrects: 1.5 })).toBe(boardRoomRefusals.correctsNotANumber);
	});

	it('gives the usual rounds when none is given, and refuses more than the room allows', () => {
		expect(validateRoundsLimit({})).toBe(boardRoomLimits.usualRounds);
		expect(validateRoundsLimit({ roundsLimit: 5 })).toBe(5);
		expect(validateRoundsLimit({ roundsLimit: boardRoomLimits.mostRounds + 1 })).toBe(boardRoomRefusals.roundsNotANumber);
	});
});
