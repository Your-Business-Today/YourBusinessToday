import { isMimeTypeShaped, maxAttachmentFilenameLength } from './taskAttachmentRules';

export type UploadDescriptionClaim = { filename: string; mimeType: string };

/** Why a file's name or type cannot be written to the attachment and upload-grant columns, or null when they can. */
export function validateUploadDescription(description: UploadDescriptionClaim): string | null {
	const { filename, mimeType } = description;
	if (filename === '') return 'A file needs a name: what it will be called on the task.';
	if (filename.length > maxAttachmentFilenameLength) {
		return `A file name is at most ${maxAttachmentFilenameLength} characters.`;
	}
	if (!isMimeTypeShaped(mimeType)) {
		return 'That is not a file type we can record — give one such as image/png or application/pdf.';
	}
	return null;
}
