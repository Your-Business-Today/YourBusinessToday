import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import {
	readTaskUploadLink,
	signTaskUploadLink,
	taskUploadLinkFor,
	taskUploadLinkStart,
	uploadPageLifetimeMinutes,
	uploadPagePath
} from './taskUploadLink';

const signingKey = 'a-key-only-this-site-holds';
const taskId = '1fb44eba-7319-4c37-9e4e-ea1f77a1f88a';
const accountId = '56b9ff76-c9be-42d8-9149-c46d9cd7a371';
const now = new Date('2026-10-08T12:00:00.000Z');
const oneMinuteMilliseconds = 60 * 1000;
const longestTokenLength = 80;

function minutesAfter(start: Date, minutes: number): Date {
	return new Date(start.getTime() + minutes * oneMinuteMilliseconds);
}

function flipFirstCharacter(token: string): string {
	const replacement = token.startsWith('A') ? 'B' : 'A';
	return `${replacement}${token.slice(1)}`;
}

describe('a task upload link', () => {
	const link = taskUploadLinkFor(taskId, accountId, now);
	const token = signTaskUploadLink(link, signingKey);

	it('carries its task, its person and its expiry through the token', () => {
		expect(readTaskUploadLink(token, signingKey, now)).toEqual(link);
	});

	it('lives for thirty minutes and no longer', () => {
		expect(uploadPageLifetimeMinutes).toBe(30);
		expect(readTaskUploadLink(token, signingKey, minutesAfter(now, 29))).toEqual(link);
		expect(readTaskUploadLink(token, signingKey, minutesAfter(now, 31))).toBeNull();
	});

	it('remembers when it was made, to the second', () => {
		expect(taskUploadLinkStart(link)).toBe(now.toISOString());
		const readLink = readTaskUploadLink(token, signingKey, now);
		expect(readLink === null ? null : taskUploadLinkStart(readLink)).toBe(now.toISOString());
	});

	it('opens a page the site really has', () => {
		const routesDirectory = join(import.meta.dirname, '../../../routes');
		const pageDirectory = join(routesDirectory, uploadPagePath, '[token]');
		expect(existsSync(pageDirectory)).toBe(true);
	});

	it('is short enough to hand over in a sentence', () => {
		expect(token.length).toBeLessThanOrEqual(longestTokenLength);
		expect(token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
	});

	it('is refused when what it says has been changed', () => {
		expect(readTaskUploadLink(flipFirstCharacter(token), signingKey, now)).toBeNull();
	});

	it('is refused when it points at another task under the same signature', () => {
		const [, signature] = token.split('.');
		const otherLink = taskUploadLinkFor(accountId, accountId, now);
		const [otherPayload] = signTaskUploadLink(otherLink, signingKey).split('.');
		expect(readTaskUploadLink(`${otherPayload}.${signature}`, signingKey, now)).toBeNull();
	});

	it('is refused when it was signed with another key', () => {
		expect(readTaskUploadLink(token, 'somebody-else’s-key', now)).toBeNull();
	});

	it('is refused when it is not a token at all', () => {
		expect(readTaskUploadLink('', signingKey, now)).toBeNull();
		expect(readTaskUploadLink('not-a-token', signingKey, now)).toBeNull();
		expect(readTaskUploadLink(`${token}.extra`, signingKey, now)).toBeNull();
		expect(readTaskUploadLink(token.split('.')[0], signingKey, now)).toBeNull();
	});
});
