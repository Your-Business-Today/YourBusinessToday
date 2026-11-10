import { describe, expect, it } from 'vitest';
import {
	businessBrainFileLimits,
	byteCountRefusal,
	filenameRefusal,
	mimeTypeRefusal,
	sourceFileIdsRefusal,
	validateBusinessBrainFile,
	validateSourceFileIds
} from './businessBrainFileRules';

const aFileId = '00000000-0000-0000-0000-00000000000f';
const anotherFileId = '00000000-0000-0000-0000-0000000000f2';

describe('a source file described before its upload link is granted', () => {
	it('is kept as described when its name, type and size fit', () => {
		expect(validateBusinessBrainFile('handbook.pdf', 'application/pdf', 2048)).toEqual({ filename: 'handbook.pdf', mimeType: 'application/pdf', byteCount: 2048 });
	});

	it('is refused with no name, or a name longer than the column', () => {
		expect(validateBusinessBrainFile('', 'application/pdf', 2048)).toBe(filenameRefusal);
		expect(validateBusinessBrainFile('a'.repeat(businessBrainFileLimits.longestFilename + 1), 'application/pdf', 2048)).toBe(filenameRefusal);
	});

	it('is refused when the type is not shaped as a file type', () => {
		expect(validateBusinessBrainFile('handbook.pdf', 'pdf', 2048)).toBe(mimeTypeRefusal);
	});

	it('is refused when empty, larger than the bucket takes, or not a whole number of bytes', () => {
		expect(validateBusinessBrainFile('handbook.pdf', 'application/pdf', 0)).toBe(byteCountRefusal);
		expect(validateBusinessBrainFile('handbook.pdf', 'application/pdf', businessBrainFileLimits.largestByteCount + 1)).toBe(byteCountRefusal);
		expect(validateBusinessBrainFile('handbook.pdf', 'application/pdf', 10.5)).toBe(byteCountRefusal);
		expect(validateBusinessBrainFile('handbook.pdf', 'application/pdf', '2048')).toBe(byteCountRefusal);
	});
});

describe('the source files a page names', () => {
	it('are none when none are given', () => {
		expect(validateSourceFileIds(undefined)).toEqual([]);
	});

	it('are kept as ids', () => {
		expect(validateSourceFileIds([aFileId, anotherFileId])).toEqual([aFileId, anotherFileId]);
	});

	it('are refused when not a list of ids, named twice, or too many', () => {
		expect(validateSourceFileIds(aFileId)).toBe(sourceFileIdsRefusal);
		expect(validateSourceFileIds(['handbook.pdf'])).toBe(sourceFileIdsRefusal);
		expect(validateSourceFileIds([aFileId, aFileId])).toBe(sourceFileIdsRefusal);
		const tooMany = Array.from({ length: businessBrainFileLimits.mostFilesPerPage + 1 }, () => crypto.randomUUID());
		expect(validateSourceFileIds(tooMany)).toBe(sourceFileIdsRefusal);
	});
});
