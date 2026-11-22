import { describe, expect, it } from 'vitest';
import { acceptancePageFor, readReturnPath } from './termsReturnPath';

describe('the page a person returns to once they accept the terms', () => {
	it('carries the page they asked for, with its query', () => {
		const acceptancePage = acceptancePageFor(new URL('https://example.test/projects/abc?tab=bugs'));
		expect(acceptancePage).toBe('/terms/accept?then=%2Fprojects%2Fabc%3Ftab%3Dbugs');
	});

	it('goes back only to a page on this site', () => {
		expect(readReturnPath('/projects')).toBe('/projects');
		expect(readReturnPath('//elsewhere.test')).toBe('/');
		expect(readReturnPath('https://elsewhere.test')).toBe('/');
		expect(readReturnPath(null)).toBe('/');
	});
});
