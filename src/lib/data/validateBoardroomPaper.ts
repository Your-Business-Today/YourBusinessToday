import {
	boardPaperLimits,
	boardPaperRefusals,
	isBoardPaperFileKind,
	isFittingPaperByteCount,
	isFittingPaperText
} from './boardroomPaperRules';
import type { BoardPaperContent, BoardPaperDraft } from './boardroomPaper';

const fileFields = ['filename', 'mimeType', 'byteCount'];

function readTrimmed(input: Record<string, unknown>, field: string): string {
	return String(input[field] ?? '').trim();
}

function isGiven(input: Record<string, unknown>, field: string): boolean {
	const value = input[field];
	return value !== undefined && value !== null && value !== '';
}

function validateItemNumber(value: unknown): number | null {
	if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) return null;
	return value;
}

function validateNote(input: Record<string, unknown>): BoardPaperContent | string {
	const note = readTrimmed(input, 'note');
	if (!isFittingPaperText(note, boardPaperLimits.longestNote)) return boardPaperRefusals.noteTooLong;
	return { kind: 'note', note };
}

function validateFile(input: Record<string, unknown>): BoardPaperContent | string {
	const filename = readTrimmed(input, 'filename');
	if (!isFittingPaperText(filename, boardPaperLimits.longestFilename)) return boardPaperRefusals.filenameMissing;
	const mimeType = readTrimmed(input, 'mimeType');
	if (!isBoardPaperFileKind(mimeType)) return boardPaperRefusals.mimeTypeNotAPaper;
	const byteCount = input.byteCount;
	if (!isFittingPaperByteCount(byteCount)) return boardPaperRefusals.byteCountOutOfRange;
	return { kind: 'file', filename, mimeType, byteCount };
}

function validateContent(input: Record<string, unknown>): BoardPaperContent | string {
	const hasNote = isGiven(input, 'note');
	const hasFile = fileFields.some((field) => isGiven(input, field));
	if (hasNote === hasFile) return boardPaperRefusals.noteOrFile;
	if (hasNote) return validateNote(input);
	return validateFile(input);
}

/** A paper as given, checked against the columns and the bucket it goes to, or the sentence naming what does not fit. */
export function validateBoardroomPaper(input: Record<string, unknown>): BoardPaperDraft | string {
	const itemNumber = validateItemNumber(input.itemNumber);
	if (itemNumber === null) return boardPaperRefusals.itemNumberNotANumber;
	const title = readTrimmed(input, 'title');
	if (!isFittingPaperText(title, boardPaperLimits.longestTitle)) return boardPaperRefusals.titleMissing;
	const content = validateContent(input);
	if (typeof content === 'string') return content;
	return { itemNumber, title, content };
}
