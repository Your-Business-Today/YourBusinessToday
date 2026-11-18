import { describe, expect, it } from 'vitest';
import { isOpenWhileAwaitingAccess } from './pathsOpenWhileAwaiting';

describe('isOpenWhileAwaitingAccess', () => {
	it('opens the contact page, signing in and out and the legal pages', () => {
		for (const path of [
			'/contact',
			'/account',
			'/account/sign-in',
			'/auth/confirm',
			'/privacy',
			'/terms',
		]) {
			expect(isOpenWhileAwaitingAccess(path)).toBe(true);
		}
	});

	it('closes the boards, the organisations and the connector door', () => {
		for (const path of [
			'/',
			'/projects',
			'/organisations',
			'/oauth/authorize',
			'/upload/abc',
			'/admin',
		]) {
			expect(isOpenWhileAwaitingAccess(path)).toBe(false);
		}
	});
});
