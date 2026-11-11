import { describe, expect, it } from 'vitest';
import { isPastDue } from './dueDate';

const lateEveningOnTheTwelfth = new Date('2026-11-12T23:30:00Z');

describe('a due date that has passed', () => {
	it('is past once the UK day is after it', () => {
		expect(isPastDue('2026-11-11', false, lateEveningOnTheTwelfth)).toBe(true);
	});

	it('is not past on the day itself', () => {
		expect(isPastDue('2026-11-12', false, lateEveningOnTheTwelfth)).toBe(false);
	});

	it('is never past for finished work or work with no date', () => {
		expect(isPastDue('2026-11-01', true, lateEveningOnTheTwelfth)).toBe(false);
		expect(isPastDue(null, false, lateEveningOnTheTwelfth)).toBe(false);
	});
});
