import { describe, expect, it } from 'vitest';
import { validateBoardroomBrief, validateBriefVersion } from './validateBoardroomBrief';
import { boardBriefLimits, boardBriefRefusals } from './boardroomBriefRules';

const longestPart = boardBriefLimits.longestPart;
const brief = { itemNumber: 2, position: '  For it.  ', mayShare: 'The numbers', mustNotShare: '', mustComeBack: undefined };

describe('checking a brief against its columns', () => {
	it('keeps the position trimmed and leaves a part not given as nothing said', () => {
		expect(validateBoardroomBrief(brief)).toEqual({
			itemNumber: 2,
			position: 'For it.',
			mayShare: 'The numbers',
			mustNotShare: null,
			mustComeBack: null
		});
	});

	it('refuses a brief with no position, or a position longer than its column', () => {
		expect(validateBoardroomBrief({ ...brief, position: '   ' })).toBe(boardBriefRefusals.positionMissing);
		expect(validateBoardroomBrief({ ...brief, position: 'x'.repeat(longestPart + 1) })).toBe(boardBriefRefusals.positionMissing);
		expect(validateBoardroomBrief({ ...brief, position: 'x'.repeat(longestPart) })).not.toBeTypeOf('string');
	});

	it('refuses, never trims, a part longer than its column, naming that part', () => {
		const tooLong = 'x'.repeat(longestPart + 1);
		expect(validateBoardroomBrief({ ...brief, mayShare: tooLong })).toBe(boardBriefRefusals.mayShareTooLong);
		expect(validateBoardroomBrief({ ...brief, mustNotShare: tooLong })).toBe(boardBriefRefusals.mustNotShareTooLong);
		expect(validateBoardroomBrief({ ...brief, mustComeBack: tooLong })).toBe(boardBriefRefusals.mustComeBackTooLong);
	});

	it('refuses an item number that is not a whole number from 1', () => {
		for (const itemNumber of [0, 1.5, '2', undefined]) {
			expect(validateBoardroomBrief({ ...brief, itemNumber })).toBe(boardBriefRefusals.itemNumberNotANumber);
		}
	});

	it('reads the version asked for, the latest when none is given', () => {
		expect(validateBriefVersion({})).toBeNull();
		expect(validateBriefVersion({ version: 3 })).toBe(3);
		expect(validateBriefVersion({ version: 0 })).toBe(boardBriefRefusals.versionNotANumber);
	});
});
