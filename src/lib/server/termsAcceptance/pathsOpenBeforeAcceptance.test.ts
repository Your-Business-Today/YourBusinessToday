import { describe, expect, it } from 'vitest';
import { isOpenBeforeAcceptingTerms } from './pathsOpenBeforeAcceptance';

describe('isOpenBeforeAcceptingTerms', () => {
	it('opens the terms, the skills they link to, the privacy statement and signing in and out', () => {
		for (const path of [
			'/terms',
			'/terms/accept',
			'/terms/skills',
			'/privacy',
			'/account',
			'/account/sign-in',
			'/account/set-password',
			'/auth/confirm',
			'/api/mcp'
		]) {
			expect(isOpenBeforeAcceptingTerms(path)).toBe(true);
		}
	});

	it('closes every page that uses the site', () => {
		for (const path of ['/', '/projects', '/organisations', '/oauth/authorize', '/upload/abc', '/admin']) {
			expect(isOpenBeforeAcceptingTerms(path)).toBe(false);
		}
	});
});
