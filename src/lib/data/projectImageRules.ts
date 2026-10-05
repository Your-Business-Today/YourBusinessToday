import {
	isMimeTypeShaped,
	isWithinAttachmentLimit,
	maxAttachmentFilenameLength
} from './taskAttachmentRules';
import type { AttachmentUpload } from '$lib/server/projects/attachmentRecord';

const imageMimeTypePrefix = 'image/';

export const imageFileAccept = 'image/*';

export function isImageMimeType(mimeType: string): boolean {
	return isMimeTypeShaped(mimeType) && mimeType.startsWith(imageMimeTypePrefix);
}

export function projectImageLimitDescription(): string {
	return 'Any image up to 25MB.';
}

/** Why an image cannot go into the bank, against the project_images columns — null when it can. */
export function projectImageUploadProblem(upload: AttachmentUpload): string | null {
	const { filename } = upload;
	if (filename.length > maxAttachmentFilenameLength) {
		return `A file name is at most ${maxAttachmentFilenameLength} characters.`;
	}
	if (!isImageMimeType(upload.mimeType)) return 'Only images go in the image bank.';
	if (upload.byteCount <= 0) return 'That image is empty.';
	if (!isWithinAttachmentLimit(upload.byteCount)) {
		return `That image is too large. ${projectImageLimitDescription()}`;
	}
	return null;
}
