import { describe, expect, it } from 'vitest';
import { canConfirmMap, mapConfirmationHeldBack } from './mapConfirmed';

const tallyOf = (right: number, notRight: number, notChecked: number) => ({ right, notRight, notChecked });

describe('when a client may confirm their workflow map', () => {
	it('opens once no station is marked not right, whether or not every station is checked', () => {
		expect(canConfirmMap(tallyOf(3, 0, 2))).toBe(true);
	});

	it('stays shut while any station is marked not right, and says how many', () => {
		expect(canConfirmMap(tallyOf(3, 2, 0))).toBe(false);
		expect(mapConfirmationHeldBack(tallyOf(3, 2, 0))).toContain('2 stations are marked not right.');
		expect(mapConfirmationHeldBack(tallyOf(3, 1, 0))).toContain('1 station is marked not right.');
	});

	it('stays shut on a map with no stations', () => {
		expect(canConfirmMap(tallyOf(0, 0, 0))).toBe(false);
		expect(mapConfirmationHeldBack(tallyOf(0, 0, 0))).toContain('no stations');
	});
});
