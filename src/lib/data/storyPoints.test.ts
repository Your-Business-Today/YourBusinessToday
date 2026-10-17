import { describe, expect, it } from 'vitest';
import { readExactStoryPoints } from './storyPoints';

describe('readExactStoryPoints', () => {
	it('reads a Fibonacci size as given', () => {
		expect(readExactStoryPoints('13')).toBe(13);
	});

	it('refuses a size that is not on the scale rather than defaulting it', () => {
		expect(readExactStoryPoints('4')).toBeNull();
		expect(readExactStoryPoints('')).toBeNull();
		expect(readExactStoryPoints(null)).toBeNull();
	});
});
