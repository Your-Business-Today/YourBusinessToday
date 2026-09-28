import { isMimeTypeShaped, maxAttachmentFilenameLength } from '$lib/data/taskAttachmentRules';
import { readText } from '../actionTypes';
import type { UploadDescription } from '$lib/server/projects/openTaskUploadGrant';

/** The name and type a file will be shown under, checked against the grant's columns. */
export function readUploadDescription(
	input: Record<string, unknown>
): UploadDescription | string {
	const filename = readText(input, 'filename');
	const mimeType = readText(input, 'mimeType');
	if (filename === '') return 'A filename is needed: what the file will be called on the task.';
	if (filename.length > maxAttachmentFilenameLength) {
		return `A filename is at most ${maxAttachmentFilenameLength} characters.`;
	}
	if (!isMimeTypeShaped(mimeType)) {
		return 'A mimeType is needed, such as image/png or application/pdf.';
	}
	return { filename, mimeType };
}
