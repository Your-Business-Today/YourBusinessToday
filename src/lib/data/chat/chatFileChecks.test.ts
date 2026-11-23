import { describe, expect, it } from 'vitest';
import { chatFileRefusal, validateChatFileFacts } from './chatFileChecks';
import { chatFileLimits, chatFileRefusals, chatFileTypes, fileEmptyRefusal, fileKindRefusal, fileTooLargeRefusal } from './chatFileRules';
import { documentFileTypes } from '$lib/projectDocuments/documentLimits';

const photo = { fileName: 'slab.jpg', contentType: 'image/jpeg', sizeBytes: 2_000_000 };

describe('chatFileRefusal', () => {
	it('lets a photo, a HEIC from a phone, a PDF and every kind a project document may be go on a message', () => {
		expect(chatFileRefusal(photo)).toBeNull();
		expect(chatFileRefusal({ ...photo, contentType: 'image/heic' })).toBeNull();
		expect(chatFileRefusal({ ...photo, contentType: 'image/gif' })).toBeNull();
		for (const contentType of documentFileTypes) expect(chatFileRefusal({ ...photo, contentType })).toBeNull();
		expect(chatFileTypes).toEqual(expect.arrayContaining([...documentFileTypes]));
	});

	it('takes a file of the largest size and refuses a byte more, by its name and the limit', () => {
		expect(chatFileRefusal({ ...photo, sizeBytes: chatFileLimits.largestSizeBytes })).toBeNull();
		expect(chatFileRefusal({ ...photo, sizeBytes: chatFileLimits.largestSizeBytes + 1 })).toBe(fileTooLargeRefusal('slab.jpg'));
		expect(fileTooLargeRefusal('slab.jpg')).toContain(`${chatFileLimits.largestMegabytes} MB`);
	});

	it('refuses an empty file, a kind the chat does not keep, and a name that does not fit', () => {
		expect(chatFileRefusal({ ...photo, sizeBytes: 0 })).toBe(fileEmptyRefusal('slab.jpg'));
		expect(chatFileRefusal({ ...photo, contentType: 'application/x-msdownload' })).toBe(fileKindRefusal('slab.jpg'));
		expect(chatFileRefusal({ ...photo, contentType: '' })).toBe(fileKindRefusal('slab.jpg'));
		expect(chatFileRefusal({ ...photo, fileName: '' })).toBe(chatFileRefusals.fileName);
		expect(chatFileRefusal({ ...photo, fileName: 'a'.repeat(chatFileLimits.longestFileName + 1) })).toBe(chatFileRefusals.fileName);
	});
});

describe('validateChatFileFacts', () => {
	it('reads the file as the grant form describes it, its size sent as text', () => {
		expect(validateChatFileFacts({ fileName: ' slab.jpg ', contentType: 'image/jpeg', sizeBytes: '2000000' })).toEqual(photo);
	});

	it('refuses a size that is not a whole number, rather than reading it as one', () => {
		expect(validateChatFileFacts({ fileName: 'slab.jpg', contentType: 'image/jpeg', sizeBytes: '2.5' })).toBe(fileEmptyRefusal('slab.jpg'));
		expect(validateChatFileFacts({ fileName: 'slab.jpg', contentType: 'image/jpeg' })).toBe(fileEmptyRefusal('slab.jpg'));
	});
});
