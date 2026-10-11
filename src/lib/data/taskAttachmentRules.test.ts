import { describe, expect, it } from 'vitest';
import { spreadsheetMimeType, wordDocumentMimeType } from './officeMimeTypes';
import { contentKindFor, maxInlineAttachmentByteCount } from './taskAttachmentRules';

const small = 1024;
const tooBigToCarry = maxInlineAttachmentByteCount + 1;

describe('contentKindFor', () => {
	it('draws text out of documents whatever their size', () => {
		expect(contentKindFor('text/markdown', tooBigToCarry)).toBe('text');
		expect(contentKindFor('application/json', small)).toBe('text');
		expect(contentKindFor(wordDocumentMimeType, tooBigToCarry)).toBe('wordDocument');
		expect(contentKindFor('application/pdf', tooBigToCarry)).toBe('pdf');
		expect(contentKindFor(spreadsheetMimeType, tooBigToCarry)).toBe('spreadsheet');
	});

	it('carries a small image as an image and any other small file as itself', () => {
		expect(contentKindFor('image/png', small)).toBe('image');
		expect(contentKindFor('image/webp', maxInlineAttachmentByteCount)).toBe('image');
		expect(contentKindFor('image/svg+xml', small)).toBe('file');
		expect(contentKindFor('application/zip', small)).toBe('file');
	});

	it('links to a file too big to carry', () => {
		expect(contentKindFor('image/png', tooBigToCarry)).toBe('link');
		expect(contentKindFor('application/zip', tooBigToCarry)).toBe('link');
	});
});
