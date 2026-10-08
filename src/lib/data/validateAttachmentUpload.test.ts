import { describe, expect, it } from 'vitest';
import { maxAttachmentByteCount, maxAttachmentFilenameLength } from './taskAttachmentRules';
import { validateAttachmentUpload } from './validateAttachmentUpload';

const screenshot = { filename: 'invoice-rounding.png', mimeType: 'image/png', byteCount: 1024 };

describe('validateAttachmentUpload', () => {
	it('lets through a file that fits the columns it is recorded in', () => {
		expect(validateAttachmentUpload(screenshot)).toBeNull();
		expect(validateAttachmentUpload({ ...screenshot, byteCount: maxAttachmentByteCount })).toBeNull();
	});

	it('names what is wrong with a file name rather than cutting it to fit', () => {
		const longName = 'x'.repeat(maxAttachmentFilenameLength + 1);
		expect(validateAttachmentUpload({ ...screenshot, filename: longName })).toContain('255');
		expect(validateAttachmentUpload({ ...screenshot, filename: '' })).toContain('name');
	});

	it('refuses a type that is not shaped like one', () => {
		expect(validateAttachmentUpload({ ...screenshot, mimeType: 'a picture' })).toContain('file type');
	});

	it('refuses a size that is nothing, not a whole number, or over the limit', () => {
		expect(validateAttachmentUpload({ ...screenshot, byteCount: 0 })).toContain('empty');
		expect(validateAttachmentUpload({ ...screenshot, byteCount: Number.NaN })).toContain('empty');
		const tooLarge = { ...screenshot, byteCount: maxAttachmentByteCount + 1 };
		expect(validateAttachmentUpload(tooLarge)).toContain('too large');
	});
});
