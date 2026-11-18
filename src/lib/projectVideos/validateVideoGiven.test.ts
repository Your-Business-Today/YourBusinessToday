import { describe, expect, it } from 'vitest';
import { validateVideoChanges } from './validateVideoDetails';
import { validateVideoGiven } from './validateVideoGiven';

const signingIn = {
	title: 'Signing in',
	description: 'How to sign in with Microsoft.',
	section: 'Getting started',
	position: 10,
	durationSeconds: 95,
	filename: 'signing-in.mp4',
	mimeType: 'video/mp4',
	byteCount: 12_000_000
};

describe('a new tutorial video as described', () => {
	it('keeps its words, its film and no thumbnail when none is named', () => {
		expect(validateVideoGiven(signingIn)).toEqual({
			details: { title: 'Signing in', description: 'How to sign in with Microsoft.', section: 'Getting started', position: 10, durationSeconds: 95, library: 'tutorials' },
			film: { filename: 'signing-in.mp4', mimeType: 'video/mp4', byteCount: 12_000_000 },
			thumbnail: null,
			captions: null
		});
	});

	it('takes a thumbnail named beside the film', () => {
		const given = validateVideoGiven({ ...signingIn, thumbnailFilename: 'signing-in.jpg', thumbnailMimeType: 'image/jpeg', thumbnailByteCount: 80_000 });
		expect(given).toMatchObject({ thumbnail: { filename: 'signing-in.jpg', mimeType: 'image/jpeg', byteCount: 80_000 } });
	});

	it('refuses by name a value that does not fit its column, and never trims it to fit', () => {
		expect(validateVideoGiven({ ...signingIn, title: 'x'.repeat(121) })).toContain('title');
		expect(validateVideoGiven({ ...signingIn, section: ' ' })).toContain('section');
		expect(validateVideoGiven({ ...signingIn, position: 1.5 })).toContain('position');
		expect(validateVideoGiven({ ...signingIn, durationSeconds: 0 })).toContain('durationSeconds');
		expect(validateVideoGiven({ ...signingIn, library: 'adverts' })).toContain('library');
		expect(validateVideoGiven({ ...signingIn, mimeType: 'video/x-msvideo' })).toContain('mimeType');
		expect(validateVideoGiven({ ...signingIn, byteCount: 60 * 1024 * 1024 })).toContain('byteCount');
		expect(validateVideoGiven({ ...signingIn, thumbnailFilename: 'a.gif', thumbnailMimeType: 'image/gif', thumbnailByteCount: 9 })).toContain('thumbnailMimeType');
		expect(validateVideoGiven({ ...signingIn, captionsFilename: 'a.srt', captionsMimeType: 'application/x-subrip', captionsByteCount: 9 })).toContain('captionsMimeType');
	});
});

describe('a change to a project video', () => {
	it('checks only what it names', () => {
		expect(validateVideoChanges({ position: 20 })).toEqual({ position: 20 });
		expect(validateVideoChanges({ title: '' })).toContain('title');
	});

	it('moves a video into the promotional library when asked', () => {
		expect(validateVideoChanges({ library: 'promotional' })).toEqual({ library: 'promotional' });
	});

	it('is refused when it names nothing to change', () => {
		expect(validateVideoChanges({})).toContain('name at least one of');
	});
});
