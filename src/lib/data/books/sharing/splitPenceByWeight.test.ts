import { describe, expect, it } from 'vitest';
import { splitPenceByWeight } from './splitPenceByWeight';
import { splitPenceEvenly } from './splitPence';

describe('splitPenceByWeight', () => {
	it('gives a member of weight 3 three quarters and one of weight 1 a quarter', () => {
		expect(splitPenceByWeight(1000, [3, 1])).toEqual([750, 250]);
	});

	it('splits as evenly as the equal split when every weight is the same', () => {
		expect(splitPenceByWeight(7900, Array(12).fill(1))).toEqual(splitPenceEvenly(7900, 12));
		expect(splitPenceByWeight(100, [2, 2, 2])).toEqual([34, 33, 33]);
	});

	it('gives the pence left over to the parts that lost most to rounding, so the parts add up', () => {
		const parts = splitPenceByWeight(101, [1.5, 0.25, 0.25]);
		expect(parts).toEqual([76, 13, 12]);
		expect(parts.reduce((total, part) => total + part, 0)).toBe(101);
	});
});
