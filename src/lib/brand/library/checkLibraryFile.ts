import { isMimeTypeShaped } from '$lib/data/taskAttachmentRules';
import { LibraryLimits } from './libraryLimits';

/** The file of a library item as described before it is sent. */
export type LibraryFileGiven = { filename: string; mimeType: string; byteCount: number };

const { longestFilename, largestByteCount, largestMegabytes } = LibraryLimits;
const photoOrVideoPattern = /^(image|video)\//;

export const filenameRefusal = `filename is what the file is called, such as kitchen-finished.jpg: required, at most ${longestFilename} characters`;
export const mimeTypeRefusal = 'mimeType is the type of the file, and the library keeps only photos and videos, such as image/jpeg or video/mp4';
export const byteCountRefusal = `byteCount is the size of the file in bytes: a whole number from 1 up to ${largestByteCount} (${largestMegabytes} MB)`;

/** The file as described, checked against its columns and the bucket, or the reason it cannot be kept. */
export function checkLibraryFile(input: Record<string, unknown>): LibraryFileGiven | string {
	const filename = typeof input.filename === 'string' ? input.filename : '';
	const isFilenameFitting = filename !== '' && filename.length <= longestFilename;
	if (!isFilenameFitting) return filenameRefusal;
	const mimeType = typeof input.mimeType === 'string' ? input.mimeType : '';
	const isPhotoOrVideo = isMimeTypeShaped(mimeType) && photoOrVideoPattern.test(mimeType);
	if (!isPhotoOrVideo) return mimeTypeRefusal;
	const byteCount = input.byteCount;
	if (!isFittingByteCount(byteCount)) return byteCountRefusal;
	return { filename, mimeType, byteCount };
}

function isFittingByteCount(byteCount: unknown): byteCount is number {
	if (typeof byteCount !== 'number' || !Number.isInteger(byteCount)) return false;
	return byteCount >= 1 && byteCount <= largestByteCount;
}
