import { describe, expect, it } from 'vitest';
import { checkPictureNeed } from './checkPictureNeed';
import { PictureLimits } from './pictureLimits';
import { pictureStandingOf, isAwaitingPicture, noPictures } from './postPictures';
import { problemWithChoosingItem } from '../library/choosableItem';
import type { LibraryItem } from '../library/libraryItem';

const kitchen = {
	id: 'kitchen',
	filename: 'kitchen-finished.jpg',
	mimeType: 'image/jpeg',
	byteCount: 2_000_000,
	storagePath: 'jewel/kitchen/kitchen-finished.jpg',
	shows: 'The finished kitchen at Mill Lane',
	takenOn: '2026-11-03',
	posting: 'permission_given',
	permissionGivenBy: 'Mrs Patel',
	addedBy: 'nigel',
	recordedAt: '2026-11-04T09:30:00Z'
} satisfies LibraryItem;

describe('where a post’s picture stands', () => {
	it('is not said until someone says what the post needs', () => {
		expect(pictureStandingOf(noPictures)).toBe('none_said');
		expect(isAwaitingPicture({ standing: 'none_said' })).toBe(false);
	});

	it('waits on a picture once one is needed and none is chosen', () => {
		expect(pictureStandingOf({ ...noPictures, needed: 'The team fitting a door' })).toBe('waiting');
		expect(isAwaitingPicture({ standing: 'waiting' })).toBe(true);
	});

	it('has its picture once one that may be posted is chosen, whether or not a need was said', () => {
		expect(pictureStandingOf({ ...noPictures, chosen: [kitchen] })).toBe('chosen');
		expect(pictureStandingOf({ needed: 'A kitchen', expectedFrom: null, chosen: [kitchen] })).toBe('chosen');
	});

	it('shows a picture since marked not to be posted rather than hiding it, and waits again', () => {
		const withdrawn = { ...kitchen, posting: 'not_to_be_posted' as const, permissionGivenBy: null };
		expect(pictureStandingOf({ ...noPictures, chosen: [kitchen, withdrawn] })).toBe('no_longer_postable');
		expect(isAwaitingPicture({ standing: 'no_longer_postable' })).toBe(true);
	});
});

describe('saying what picture a post needs', () => {
	it('keeps the words, and where it is expected from when that is said', () => {
		const given = { pictureNeeded: ' The team fitting a door ', expectedFrom: ' The team on the job ' };
		expect(checkPictureNeed(given)).toEqual({ need: { needed: 'The team fitting a door', expectedFrom: 'The team on the job' } });
		expect(checkPictureNeed({ pictureNeeded: 'A door' })).toEqual({ need: { needed: 'A door', expectedFrom: null } });
	});

	it('refuses an empty need, and either value longer than its column, by name', () => {
		expect(checkPictureNeed({ pictureNeeded: ' ' })).toEqual({ problem: 'pictureNeeded is empty: say what photo or video the post needs' });
		const longNeed = 'x'.repeat(PictureLimits.neededCharacters + 1);
		expect(checkPictureNeed({ pictureNeeded: longNeed })).toEqual({ problem: 'pictureNeeded is 501 characters; keep it to 500' });
		const longSource = 'x'.repeat(PictureLimits.expectedFromCharacters + 1);
		expect(checkPictureNeed({ pictureNeeded: 'A door', expectedFrom: longSource })).toEqual({ problem: 'expectedFrom is 201 characters; keep it to 200' });
		expect(checkPictureNeed({ pictureNeeded: 'A door', expectedFrom: 4 })).toEqual({ problem: 'expectedFrom is words, not number' });
	});
});

describe('the library’s rule for choosing an item for a post', () => {
	it('lets an item go in a post once its file has arrived and nobody said it may not be posted', () => {
		expect(problemWithChoosingItem(kitchen)).toBeNull();
		expect(problemWithChoosingItem({ ...kitchen, posting: 'nothing_recognisable' })).toBeNull();
	});

	it('refuses, by name, an item not to be posted and one whose file has not arrived', () => {
		expect(problemWithChoosingItem({ ...kitchen, posting: 'not_to_be_posted' })).toBe(
			'kitchen-finished.jpg is marked not to be posted, so it cannot go in a post'
		);
		expect(problemWithChoosingItem({ ...kitchen, recordedAt: null })).toBe(
			'kitchen-finished.jpg has not arrived in the library yet, so it cannot go in a post'
		);
	});
});
