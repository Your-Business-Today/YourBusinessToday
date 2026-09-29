import { describe, expect, it } from 'vitest';
import { parsePriorityNumber, parseRank } from './rankInput';

describe('parseRank', () => {
	it('reads whole numbers however they arrive and nothing else', () => {
		expect(parseRank('3')).toBe(3);
		expect(parseRank(3)).toBe(3);
		expect(parseRank('')).toBeNull();
		expect(parseRank('2.5')).toBeNull();
		expect(parseRank('top')).toBeNull();
		expect(parseRank(undefined)).toBeNull();
	});
});

describe('parsePriorityNumber', () => {
	it('reads a priority from 1 up and refuses anything below or unnumbered', () => {
		expect(parsePriorityNumber('1')).toBe(1);
		expect(parsePriorityNumber('99')).toBe(99);
		expect(parsePriorityNumber('0')).toBeNull();
		expect(parsePriorityNumber('-2')).toBeNull();
		expect(parsePriorityNumber('1.5')).toBeNull();
		expect(parsePriorityNumber('')).toBeNull();
	});
});
