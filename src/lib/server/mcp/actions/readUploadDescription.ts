import { validateUploadDescription } from '$lib/data/validateUploadDescription';
import { readText } from '../actionTypes';
import type { UploadDescription } from '$lib/server/projects/openTaskUploadGrant';

/** The name and type a file will be shown under, checked against the grant's columns. */
export function readUploadDescription(
	input: Record<string, unknown>
): UploadDescription | string {
	const description = { filename: readText(input, 'filename'), mimeType: readText(input, 'mimeType') };
	return validateUploadDescription(description) ?? description;
}
