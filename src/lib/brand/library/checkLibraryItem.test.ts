import { describe, expect, it } from 'vitest';
import { checkLibraryItem } from './checkLibraryItem';
import { LibraryLimits } from './libraryLimits';

const today = '2026-11-10';
const kitchen = {
	filename: 'kitchen-finished.jpg',
	mimeType: 'image/jpeg',
	byteCount: 2_000_000,
	shows: 'The finished kitchen at Mill Lane',
	takenOn: '2026-11-03',
	posting: 'permission_given',
	permissionGivenBy: 'Mrs Patel, the homeowner'
};

describe('checking a photo or video before the brand keeps it', () => {
	it('keeps one that fits every column, with who gave permission', () => {
		expect(checkLibraryItem(kitchen, today)).toEqual({ ...kitchen, posting: 'permission_given' });
	});

	it('keeps one nobody can be recognised in, or one not to be posted, with nobody named', () => {
		const street = { ...kitchen, posting: 'nothing_recognisable', permissionGivenBy: '' };
		expect(checkLibraryItem(street, today)).toMatchObject({ posting: 'nothing_recognisable', permissionGivenBy: null });
		const kept = { ...kitchen, posting: 'not_to_be_posted', permissionGivenBy: undefined };
		expect(checkLibraryItem(kept, today)).toMatchObject({ posting: 'not_to_be_posted', permissionGivenBy: null });
	});

	it('refuses anything but a photo or a video, and a file too large for the bucket', () => {
		expect(checkLibraryItem({ ...kitchen, mimeType: 'application/pdf' }, today)).toContain('only photos and videos');
		const tooLarge = { ...kitchen, byteCount: LibraryLimits.largestByteCount + 1 };
		expect(checkLibraryItem(tooLarge, today)).toContain('50 MB');
	});

	it('asks what it shows, and refuses more than the column holds', () => {
		expect(checkLibraryItem({ ...kitchen, shows: '  ' }, today)).toBe('shows is empty: say what the photo or video shows');
		const tooLong = 'x'.repeat(LibraryLimits.showsCharacters + 1);
		expect(checkLibraryItem({ ...kitchen, shows: tooLong }, today)).toBe('shows is 501 characters; keep it to 500');
	});

	it('refuses a day that is not on the calendar or is after today', () => {
		expect(checkLibraryItem({ ...kitchen, takenOn: '2026-02-30' }, today)).toBe('takenOn is not a day on the calendar; 2026-02-30 was given');
		expect(checkLibraryItem({ ...kitchen, takenOn: '2026-11-11' }, today)).toContain('is after today');
	});

	it('names who gave permission only when permission was given', () => {
		const nobodyNamed = { ...kitchen, permissionGivenBy: '' };
		expect(checkLibraryItem(nobodyNamed, today)).toContain('name who gave permission');
		const namedWithoutPermission = { ...kitchen, posting: 'not_to_be_posted' };
		expect(checkLibraryItem(namedWithoutPermission, today)).toBe('permissionGivenBy is only given when posting is permission_given');
		expect(checkLibraryItem({ ...kitchen, posting: 'maybe' }, today)).toContain('posting is one of');
	});
});
