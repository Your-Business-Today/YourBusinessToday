import { describe, expect, it } from 'vitest';
import { branchNameRefusal, branchWebAddress, pullRequestUrlRefusal } from './branchName';

describe('branch names', () => {
	it('accepts the names tasks are worked on, and an empty name that clears one', () => {
		expect(branchNameRefusal('feature/weekly-cashflow-grid')).toBeNull();
		expect(branchNameRefusal('claude/confident-babbage-ce83vn')).toBeNull();
		expect(branchNameRefusal('')).toBeNull();
	});

	it('refuses what git would, rather than repairing it', () => {
		expect(branchNameRefusal('has space')).not.toBeNull();
		expect(branchNameRefusal('two..dots')).not.toBeNull();
		expect(branchNameRefusal('ends/')).not.toBeNull();
		expect(branchNameRefusal('x'.repeat(256))).not.toBeNull();
	});

	it('refuses a pull request that is not a web address', () => {
		expect(pullRequestUrlRefusal('https://github.com/owner/repo/pull/1')).toBeNull();
		expect(pullRequestUrlRefusal('javascript:alert(1)')).not.toBeNull();
	});

	it('links a branch to its repository', () => {
		const address = branchWebAddress('https://github.com/owner/repo/', 'fix/rounding');
		expect(address).toBe('https://github.com/owner/repo/tree/fix/rounding');
		expect(branchWebAddress('', 'fix/rounding')).toBeNull();
	});
});
