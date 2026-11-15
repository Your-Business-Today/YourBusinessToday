import { beforeEach, describe, expect, it, vi } from 'vitest';

let foldersListed: string[] = [];
const filesAskedUnder: string[] = [];

vi.mock('./overtureBucket', () => ({
	listBucketFolders: async () => foldersListed,
	listBucketFiles: async (prefix: string) => (filesAskedUnder.push(prefix), [])
}));

const { findNewestRelease, listPlaceFiles, listRemovedPlaceFiles, newestReleaseOf } = await import('./overtureReleases');

describe("Overture's releases", () => {
	beforeEach(() => {
		foldersListed = [];
		filesAskedUnder.length = 0;
	});

	it('takes the newest by the day in its name', () => {
		expect(newestReleaseOf(['2026-10-21.0', '2026-09-23.1', '2026-09-23.0'])).toBe('2026-10-21.0');
	});

	it('takes the higher number of two released the same day, counting the number as a number', () => {
		expect(newestReleaseOf(['2026-09-23.9', '2026-09-23.10', '2026-09-23.2'])).toBe('2026-09-23.10');
	});

	it('passes over a folder that is not a release', () => {
		expect(newestReleaseOf(['latest', '2026-10-21.0-beta', 'dev', '2026-09-23.1'])).toBe('2026-09-23.1');
		expect(newestReleaseOf(['latest'])).toBeNull();
	});

	it("finds the newest release from the bucket's own list", async () => {
		foldersListed = ['2026-09-23.0', '2026-09-23.1', '2026-10-21.0'];
		expect(await findNewestRelease()).toBe('2026-10-21.0');
	});

	it('says so when the bucket lists no release, never guessing one', async () => {
		await expect(findNewestRelease()).rejects.toThrow("Overture's bucket lists no release");
	});

	it('looks for the places of a release, and for the places it took out, where Overture keeps each', async () => {
		await listPlaceFiles('2026-10-21.0');
		await listRemovedPlaceFiles('2026-10-21.0');
		expect(filesAskedUnder).toEqual(['release/2026-10-21.0/theme=places/type=place/', 'changelog/2026-10-21.0/theme=places/type=place/change_type=removed/']);
	});
});
