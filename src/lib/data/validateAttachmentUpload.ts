import {
	attachmentLimitDescription,
	isMimeTypeShaped,
	isWithinAttachmentLimit,
	maxAttachmentFilenameLength
} from './taskAttachmentRules';

export type AttachmentUploadClaim = { filename: string; mimeType: string; byteCount: number };

/**
 * Why a file cannot go on a task, against the columns its name, type and size are written to —
 * null when it can. Every door that starts an upload asks this, and so does the page before it sends.
 */
export function validateAttachmentUpload(upload: AttachmentUploadClaim): string | null {
	const { filename, mimeType, byteCount } = upload;
	if (filename === '') return 'A file needs a name.';
	if (filename.length > maxAttachmentFilenameLength) {
		return `A file name is at most ${maxAttachmentFilenameLength} characters.`;
	}
	if (!isMimeTypeShaped(mimeType)) return 'That is not a file type we can record.';
	if (!Number.isInteger(byteCount) || byteCount <= 0) return 'That file is empty.';
	if (!isWithinAttachmentLimit(byteCount)) {
		return `That file is too large. ${attachmentLimitDescription()}`;
	}
	return null;
}
