import { isMimeTypeShaped, maxAttachmentByteCount, maxAttachmentFilenameLength } from './taskAttachmentRules';
import { isUuid } from './isUuid';

/** The limits on a source file kept with Your Business Brain, the same as a task attachment's; mirrored by migration 0157. */
export const businessBrainFileLimits = {
	longestFilename: maxAttachmentFilenameLength,
	largestByteCount: maxAttachmentByteCount,
	mostFilesPerPage: 20,
	mostUnnamedFilesListed: 50,
	mostFilesListed: 100
} as const;

/** Storage keeps a signed upload link open for two hours, and the grant says so. */
export const businessBrainUploadLinkLifetimeHours = 2;

/** A source file as a client's Claude describes it before it is sent. */
export type BusinessBrainFileGiven = { filename: string; mimeType: string; byteCount: number };

const { longestFilename, largestByteCount } = businessBrainFileLimits;
const largestMegabytes = largestByteCount / (1024 * 1024);

export const filenameRefusal = `The filename is what the file is called, such as staff-handbook-2026.pdf: required, at most ${longestFilename} characters.`;
export const mimeTypeRefusal = 'The mimeType is the type of the file, such as application/pdf or image/jpeg.';
export const byteCountRefusal = `The byteCount is the size of the file in bytes: a whole number from 1 up to ${largestByteCount} (${largestMegabytes} MB).`;

/** The file as described, checked against the columns and the bucket it goes to, or a sentence naming what does not fit. */
export function validateBusinessBrainFile(filename: string, mimeType: string, byteCount: unknown): BusinessBrainFileGiven | string {
	const isFilenameFitting = filename !== '' && filename.length <= longestFilename;
	if (!isFilenameFitting) return filenameRefusal;
	if (!isMimeTypeShaped(mimeType)) return mimeTypeRefusal;
	if (!isFittingByteCount(byteCount)) return byteCountRefusal;
	return { filename, mimeType, byteCount };
}

function isFittingByteCount(byteCount: unknown): byteCount is number {
	if (typeof byteCount !== 'number' || !Number.isInteger(byteCount)) return false;
	return byteCount >= 1 && byteCount <= largestByteCount;
}

const { mostFilesPerPage } = businessBrainFileLimits;

export const sourceFileIdsRefusal =
	`The sourceFileIds are the files the page was written from, each id as record_business_brain_file_upload gave it back: ` +
	`a list of at most ${mostFilesPerPage}, each named once.`;

/** The source files a page names, as ids, or a sentence saying why the list cannot be kept; none given is an empty list. */
export function validateSourceFileIds(value: unknown): string[] | string {
	if (value === undefined || value === null) return [];
	if (!Array.isArray(value) || value.length > mostFilesPerPage) return sourceFileIdsRefusal;
	const fileIds = value.map((fileId) => (typeof fileId === 'string' ? fileId.trim() : ''));
	const isEveryIdShaped = fileIds.every(isUuid);
	const isEachNamedOnce = new Set(fileIds).size === fileIds.length;
	if (!isEveryIdShaped || !isEachNamedOnce) return sourceFileIdsRefusal;
	return fileIds;
}
