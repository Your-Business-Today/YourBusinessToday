import { describe, expect, it } from 'vitest';
import { isStagingBranch } from './stagingBranch';

describe('the staging branch', () => {
	it('is the branch named staging on a project that deploys from main', () => {
		expect(isStagingBranch('staging', 'main')).toBe(true);
	});

	it('is never the default branch, even on a project that deploys from staging', () => {
		expect(isStagingBranch('staging', 'staging')).toBe(false);
	});

	it('is not the default branch or any task branch', () => {
		expect(isStagingBranch('main', 'main')).toBe(false);
		expect(isStagingBranch('fix/rounding', 'main')).toBe(false);
	});
});
