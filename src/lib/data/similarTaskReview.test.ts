import { describe, expect, it } from 'vitest';
import { similarTaskReviewQuestion, validateReviewDecision } from './similarTaskReview';

describe('validateReviewDecision', () => {
	it('reads the three decisions and nothing else', () => {
		expect(validateReviewDecision('replace')).toBe('replace');
		expect(validateReviewDecision('delete')).toBeNull();
		expect(validateReviewDecision(undefined)).toBeNull();
	});
});

describe('similarTaskReviewQuestion', () => {
	it('names the new task, its project and who raised it', () => {
		const question = similarTaskReviewQuestion('Export the fire door register', 'Jewel PFP Portal', 'Scarlett');
		expect(question).toContain('Scarlett raised "Export the fire door register" on Jewel PFP Portal anyway');
	});
});
