import { describe, expect, it } from 'vitest';
import { hasTheSameFiles } from './branchDifference';

const changedFile = { filename: 'src/routes/+page.svelte' };

describe('hasTheSameFiles', () => {
	it('holds the same files when the head is not ahead', () => {
		expect(hasTheSameFiles({ aheadBy: 0, changedFiles: [] })).toBe(true);
	});

	it('holds the same files when only a merge commit that changes nothing is ahead', () => {
		expect(hasTheSameFiles({ aheadBy: 1, changedFiles: [] })).toBe(true);
	});

	it('differs when the commits ahead change a file', () => {
		expect(hasTheSameFiles({ aheadBy: 2, changedFiles: [changedFile] })).toBe(false);
	});

	it('differs when GitHub does not list the files, so a real change is never skipped', () => {
		expect(hasTheSameFiles({ aheadBy: 1, changedFiles: undefined })).toBe(false);
	});
});
