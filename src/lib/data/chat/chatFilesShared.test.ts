import { describe, expect, it } from 'vitest';
import { describeFilesShared, isPictureShownInRoom } from './chatFilesShared';

describe('describeFilesShared', () => {
	it('counts photos and other files in plain words', () => {
		expect(describeFilesShared(['image/jpeg'])).toBe('sent a photo');
		expect(describeFilesShared(['image/jpeg', 'image/heic'])).toBe('sent 2 photos');
		expect(describeFilesShared(['application/pdf'])).toBe('sent a file');
		expect(describeFilesShared(['image/png', 'application/pdf', 'text/csv'])).toBe('sent a photo and 2 files');
	});

	it('says nothing of a message that carries no files', () => {
		expect(describeFilesShared([])).toBe('');
	});
});

describe('isPictureShownInRoom', () => {
	it('draws the pictures every browser can, and links a HEIC photo or a document by name', () => {
		expect(isPictureShownInRoom('image/jpeg')).toBe(true);
		expect(isPictureShownInRoom('image/gif')).toBe(true);
		expect(isPictureShownInRoom('image/heic')).toBe(false);
		expect(isPictureShownInRoom('application/pdf')).toBe(false);
	});
});
