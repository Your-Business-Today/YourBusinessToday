import { describe, expect, it } from 'vitest';
import { canConfirm, confirmationHeldBack } from './contextConfirmation';

const tallyOf = (partCount: number, notRightCount: number) => ({
	partCount,
	checkedCount: notRightCount,
	rightCount: 0,
	notRightCount
});

describe('when a client may confirm their company context', () => {
	it('opens once no part is marked not right, whether or not every part is checked', () => {
		expect(canConfirm(tallyOf(5, 0))).toBe(true);
	});

	it('stays shut while any part is marked not right, and says how many', () => {
		expect(canConfirm(tallyOf(5, 2))).toBe(false);
		expect(confirmationHeldBack(tallyOf(5, 2))).toContain('2 parts are marked not right.');
		expect(confirmationHeldBack(tallyOf(5, 1))).toContain('1 part is marked not right.');
	});

	it('stays shut on a version with no parts', () => {
		expect(canConfirm(tallyOf(0, 0))).toBe(false);
		expect(confirmationHeldBack(tallyOf(0, 0))).toContain('nothing to confirm yet');
	});
});
