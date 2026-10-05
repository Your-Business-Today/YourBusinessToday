import { describe, expect, it } from 'vitest';
import { isImageMimeType, projectImageUploadProblem } from './projectImageRules';
import { maxAttachmentByteCount } from './taskAttachmentRules';

const screenshot = { filename: 'login-screenshot.png', mimeType: 'image/png', byteCount: 2048 };

describe('isImageMimeType', () => {
	it('takes an image type', () => {
		expect(isImageMimeType('image/png')).toBe(true);
		expect(isImageMimeType('image/svg+xml')).toBe(true);
	});

	it('refuses anything that is not an image', () => {
		expect(isImageMimeType('application/pdf')).toBe(false);
		expect(isImageMimeType('image/')).toBe(false);
		expect(isImageMimeType('image/png/extra')).toBe(false);
		expect(isImageMimeType('')).toBe(false);
	});
});

describe('projectImageUploadProblem', () => {
	it('takes an image within the limits', () => {
		expect(projectImageUploadProblem(screenshot)).toBeNull();
	});

	it('refuses a file that is not an image', () => {
		const document = { ...screenshot, mimeType: 'application/pdf' };
		expect(projectImageUploadProblem(document)).toMatch(/images/);
	});

	it('refuses an empty image or one over the size limit', () => {
		const tooLarge = { ...screenshot, byteCount: maxAttachmentByteCount + 1 };
		expect(projectImageUploadProblem({ ...screenshot, byteCount: 0 })).toMatch(/empty/);
		expect(projectImageUploadProblem(tooLarge)).toMatch(/too large/);
	});

	it('refuses a file name longer than its column', () => {
		const longName = { ...screenshot, filename: `${'a'.repeat(256)}.png` };
		expect(projectImageUploadProblem(longName)).toMatch(/255/);
	});
});
