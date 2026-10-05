import { deserialize } from '$app/forms';
import type { ActionResult } from '@sveltejs/kit';
import type { AttachmentUpload } from '$lib/server/projects/attachmentRecord';

export type AttachmentUploadOutcome =
	| { status: 'uploaded' }
	| { status: 'failed'; message: string };

/** The form actions that sign an upload link, and record what was sent to it under the id they gave. */
export type SignedUploadActions = { grant: string; record: string; idField: string };

export const taskAttachmentUploadActions: SignedUploadActions = {
	grant: '?/grantAttachment',
	record: '?/recordAttachment',
	idField: 'attachmentId'
};

export const projectImageUploadActions: SignedUploadActions = {
	grant: '?/grantImage',
	record: '?/recordImage',
	idField: 'imageId'
};

const unknownMimeType = 'application/octet-stream';

export async function uploadThroughSignedLink(
	file: File,
	actions: SignedUploadActions
): Promise<AttachmentUploadOutcome> {
	const upload = describeUpload(file);
	const grant = await postAction(actions.grant, upload);
	if (grant.type !== 'success') return failureFrom(grant, 'The upload could not be started.');
	const grantData = grant.data ?? {};
	const storageResponse = await fetch(String(grantData.uploadUrl), {
		method: 'PUT',
		headers: { 'content-type': upload.mimeType },
		body: file
	});
	if (!storageResponse.ok) return { status: 'failed', message: 'The file could not be uploaded.' };
	const uploadedId = String(grantData[actions.idField]);
	const recording = await postAction(actions.record, { ...upload, [actions.idField]: uploadedId });
	if (recording.type !== 'success') return failureFrom(recording, 'The upload could not be saved.');
	return { status: 'uploaded' };
}

export function uploadProgressLabel(index: number, fileCount: number, filename: string): string {
	if (fileCount === 1) return `Uploading ${filename}…`;
	return `Uploading ${index + 1} of ${fileCount} — ${filename}…`;
}

export function describeUpload(file: File): AttachmentUpload {
	return {
		filename: file.name,
		mimeType: file.type === '' ? unknownMimeType : file.type,
		byteCount: file.size
	};
}

async function postAction(
	action: string,
	fields: Record<string, string | number>
): Promise<ActionResult> {
	const formData = new FormData();
	for (const [fieldName, fieldValue] of Object.entries(fields)) {
		formData.set(fieldName, String(fieldValue));
	}
	const response = await fetch(action, {
		method: 'POST',
		headers: { accept: 'application/json', 'x-sveltekit-action': 'true' },
		cache: 'no-store',
		body: formData
	});
	return deserialize(await response.text());
}

function failureFrom(result: ActionResult, fallbackMessage: string): AttachmentUploadOutcome {
	if (result.type !== 'failure') return { status: 'failed', message: fallbackMessage };
	const failureData = result.data ?? {};
	const message = failureData.message;
	return { status: 'failed', message: typeof message === 'string' ? message : fallbackMessage };
}
