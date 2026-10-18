import { describe, expect, it } from 'vitest';
import { maxAttachmentFilenameLength } from './taskAttachmentRules';
import { validateUploadDescription } from './validateUploadDescription';

const description = { filename: 'invoice-rounding.png', mimeType: 'image/png' };

describe('validateUploadDescription', () => {
	it('lets through a name and type the columns hold', () => {
		expect(validateUploadDescription(description)).toBeNull();
		const longest = 'a'.repeat(maxAttachmentFilenameLength);
		expect(validateUploadDescription({ ...description, filename: longest })).toBeNull();
	});

	it('refuses a missing or over-long name', () => {
		expect(validateUploadDescription({ ...description, filename: '' })).toContain('name');
		const tooLong = 'a'.repeat(maxAttachmentFilenameLength + 1);
		expect(validateUploadDescription({ ...description, filename: tooLong })).toContain(String(maxAttachmentFilenameLength));
	});

	it('refuses a type that is not shaped like a mime type', () => {
		expect(validateUploadDescription({ ...description, mimeType: 'a picture' })).toContain('file type');
		expect(validateUploadDescription({ ...description, mimeType: '' })).toContain('file type');
	});
});
