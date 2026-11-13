import { describe, expect, it } from 'vitest';
import { isRefused } from '$lib/server/companyContext/contextText';
import { validateRepositoryCommit, validateRepositoryPath } from './validateRepositoryPath';

describe('a path into a product repository', () => {
	it('reads a path from the root and writes each part into the address as text', () => {
		expect(validateRepositoryPath('src/routes/[id]/+page.svelte', true)).toEqual({
			path: 'src/routes/[id]/+page.svelte',
			addressPath: 'src/routes/%5Bid%5D/%2Bpage.svelte'
		});
		expect(validateRepositoryPath('notes/a?b#c%2e%2e', true)).toEqual({ path: 'notes/a?b#c%2e%2e', addressPath: 'notes/a%3Fb%23c%252e%252e' });
	});

	it('reads no path as the root of a folder listing, and refuses it for a file', () => {
		expect(validateRepositoryPath(undefined, false)).toEqual({ path: '', addressPath: '' });
		expect(isRefused(validateRepositoryPath('', true))).toBe(true);
	});

	it.each(['..', '../other', 'src/../../other/repository', './src', '/etc/passwd', 'src//routes', 'src/', 'src\\..\\..'])(
		'refuses %s, which would leave the root or name no file',
		(path) => {
			expect(isRefused(validateRepositoryPath(path, false))).toBe(true);
		}
	);

	it('refuses a path longer than a call reads, and one that is not text', () => {
		expect(isRefused(validateRepositoryPath('a'.repeat(401), true))).toBe(true);
		expect(isRefused(validateRepositoryPath(['src'], true))).toBe(true);
	});
});

describe('the commit a door reads at', () => {
	it('takes a commit, or none for the head of the default branch', () => {
		expect(validateRepositoryCommit('0a4a30d')).toBe('0a4a30d');
		expect(validateRepositoryCommit(undefined)).toBeNull();
	});

	it.each(['main', 'HEAD~1', '0A4A30D', '0a4a3'])('refuses %s', (commit) => {
		expect(isRefused(validateRepositoryCommit(commit))).toBe(true);
	});
});
