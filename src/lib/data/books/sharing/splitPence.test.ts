import { describe, expect, it } from 'vitest';
import { splitPenceEvenly } from './splitPence';

describe('splitPenceEvenly', () => {
	it('gives the odd pence to the first parts, so the parts add up to the whole', () => {
		const parts = splitPenceEvenly(7900, 12);
		expect(parts).toEqual([659, 659, 659, 659, 658, 658, 658, 658, 658, 658, 658, 658]);
		expect(parts.reduce((total, part) => total + part, 0)).toBe(7900);
	});

	it('keeps the whole in one part', () => {
		expect(splitPenceEvenly(2500, 1)).toEqual([2500]);
	});
});
