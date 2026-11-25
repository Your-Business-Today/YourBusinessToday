import { describe, expect, it } from 'vitest';
import { designReviewLimits } from '$lib/data/designReview';
import { isDesignTextRefused, validateDesignText } from './designChangeField';

describe('validateDesignText', () => {
	it('leaves an empty design change out', () => {
		expect(validateDesignText({ designChange: '  ' }, 'designChange')).toEqual({ text: undefined });
	});

	it('keeps one that fits and refuses one longer than a task holds, by name', () => {
		const fits = 'a'.repeat(designReviewLimits.longestText);
		expect(validateDesignText({ designChange: fits }, 'designChange')).toEqual({ text: fits });
		const choice = validateDesignText({ designChange: `${fits}a` }, 'designChange');
		expect(isDesignTextRefused(choice)).toBe(true);
		expect(choice).toEqual({ refusal: expect.stringContaining('designChange') });
	});
});
