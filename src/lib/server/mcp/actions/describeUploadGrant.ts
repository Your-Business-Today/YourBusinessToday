import { formatBritishDateTime } from '$lib/data/britishDate';
import { uploadLinkLifetimeMinutes } from '$lib/server/projects/uploadGrantRecord';
import type { OpenedUploadGrant, UploadDescription } from '$lib/server/projects/openTaskUploadGrant';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export const noSuchUploadGrant =
	'No upload link with that id was granted to you on that task. Call grant_task_upload for one.';

export function describeUploadGrant(
	task: ProjectTask,
	upload: UploadDescription,
	grant: OpenedUploadGrant
): string {
	const sendBy = formatBritishDateTime(grant.expiresAt);
	return [
		`Upload link for "${task.title}", to be used once, by ${sendBy} ` +
			`(${uploadLinkLifetimeMinutes} minutes from now). Send "${upload.filename}" to it as an HTTP ` +
			`PUT with the raw bytes as the body and content-type ${upload.mimeType}, for example:`,
		`curl --fail --upload-file <path to the file> -H "content-type: ${upload.mimeType}" "${grant.uploadUrl}"`,
		`Then call record_task_upload with taskId ${task.id} and uploadId ${grant.grantId} so the ` +
			'file appears on the task as an attachment.'
	].join('\n');
}
