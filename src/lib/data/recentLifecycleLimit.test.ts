import { describe, expect, it } from 'vitest';
import { recentLifecycleLimits, validateRecentLifecycleLimit } from './recentLifecycleLimit';

describe('validateRecentLifecycleLimit', () => {
	it('reads the usual count when none is given', () => {
		expect(validateRecentLifecycleLimit(undefined)).toBe(recentLifecycleLimits.usual);
	});

	it('accepts a whole number in range', () => {
		expect(validateRecentLifecycleLimit(recentLifecycleLimits.most)).toBe(recentLifecycleLimits.most);
	});

	it('refuses a number out of range, a fraction or a word', () => {
		expect(validateRecentLifecycleLimit(recentLifecycleLimits.most + 1)).toBeUndefined();
		expect(validateRecentLifecycleLimit(0)).toBeUndefined();
		expect(validateRecentLifecycleLimit(2.5)).toBeUndefined();
		expect(validateRecentLifecycleLimit('ten')).toBeUndefined();
	});
});
