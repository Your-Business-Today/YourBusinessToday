import { describe, expect, it } from 'vitest';
import { validateBoardroomPaper } from './validateBoardroomPaper';
import { boardPaperLimits, boardPaperRefusals } from './boardroomPaperRules';

const pdf = 'application/pdf';
const accounts = { itemNumber: 2, title: 'Management accounts to 31 October' };
const accountsFile = { ...accounts, filename: 'accounts-october-2026.pdf', mimeType: pdf, byteCount: 120_000 };

describe('checking a board paper against its columns', () => {
	it('takes a written note on an item by its number', () => {
		const draft = validateBoardroomPaper({ ...accounts, note: 'Cash is up on September.' });
		expect(draft).toEqual({ ...accounts, content: { kind: 'note', note: 'Cash is up on September.' } });
	});

	it('takes a file described by its name, kind and size', () => {
		const draft = validateBoardroomPaper(accountsFile);
		expect(draft).toEqual({
			...accounts,
			content: { kind: 'file', filename: 'accounts-october-2026.pdf', mimeType: pdf, byteCount: 120_000 }
		});
	});

	it('refuses an item that is not a whole number from 1', () => {
		for (const itemNumber of [0, 1.5, '2', undefined]) {
			expect(validateBoardroomPaper({ ...accountsFile, itemNumber })).toBe(boardPaperRefusals.itemNumberNotANumber);
		}
	});

	it('refuses a missing or overlong title rather than cutting it', () => {
		const longTitle = 'x'.repeat(boardPaperLimits.longestTitle + 1);
		expect(validateBoardroomPaper({ ...accountsFile, title: ' ' })).toBe(boardPaperRefusals.titleMissing);
		expect(validateBoardroomPaper({ ...accountsFile, title: longTitle })).toBe(boardPaperRefusals.titleMissing);
	});

	it('takes a note or a file, never both and never neither', () => {
		expect(validateBoardroomPaper({ ...accountsFile, note: 'Also this' })).toBe(boardPaperRefusals.noteOrFile);
		expect(validateBoardroomPaper(accounts)).toBe(boardPaperRefusals.noteOrFile);
	});

	it('refuses a note longer than its column holds', () => {
		const note = 'x'.repeat(boardPaperLimits.longestNote + 1);
		expect(validateBoardroomPaper({ ...accounts, note })).toBe(boardPaperRefusals.noteTooLong);
	});

	it('refuses a kind of file a board does not read', () => {
		for (const mimeType of ['application/zip', 'application/x-msdownload', 'pdf', '']) {
			expect(validateBoardroomPaper({ ...accountsFile, mimeType })).toBe(boardPaperRefusals.mimeTypeNotAPaper);
		}
	});

	it('refuses a file of no size, of part of a byte, or over 25 MB', () => {
		for (const byteCount of [0, 10.5, boardPaperLimits.largestByteCount + 1, '120000']) {
			expect(validateBoardroomPaper({ ...accountsFile, byteCount })).toBe(boardPaperRefusals.byteCountOutOfRange);
		}
		const largest = validateBoardroomPaper({ ...accountsFile, byteCount: boardPaperLimits.largestByteCount });
		expect(typeof largest).toBe('object');
	});

	it('refuses a file with no name or a name longer than its column', () => {
		const filename = `${'x'.repeat(boardPaperLimits.longestFilename)}.pdf`;
		expect(validateBoardroomPaper({ ...accountsFile, filename })).toBe(boardPaperRefusals.filenameMissing);
		expect(validateBoardroomPaper({ ...accountsFile, filename: '' })).toBe(boardPaperRefusals.filenameMissing);
	});
});
