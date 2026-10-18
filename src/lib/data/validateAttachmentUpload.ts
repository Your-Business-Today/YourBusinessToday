import { attachmentLimitDescription, isWithinAttachmentLimit } from './taskAttachmentRules';
import { validateUploadDescription } from './validateUploadDescription';

export type AttachmentUploadClaim = { filename: string; mimeType: string; byteCount: number };

/**
 * Why a file cannot go on a task, against the columns its name, type and size are written to —
 * null when it can. Every door that starts an upload asks this, and so does the page before it sends.
 */
export function validateAttachmentUpload(upload: AttachmentUploadClaim): string | null {
	const { byteCount } = upload;
	const descriptionRefusal = validateUploadDescription(upload);
	if (descriptionRefusal !== null) return descriptionRefusal;
	if (!Number.isInteger(byteCount) || byteCount <= 0) return 'That file is empty.';
	if (!isWithinAttachmentLimit(byteCount)) {
		return `That file is too large. ${attachmentLimitDescription()}`;
	}
	return null;
}
