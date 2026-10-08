import { attachedAs, refusedBecause, uploadBoxOutcomes } from './uploadBoxOutcomes';
import { describeByteCount, maxInlineAttachmentByteCount } from '$lib/data/taskAttachmentRules';
import { findTaskUploadGrant } from '$lib/server/projects/findTaskUploadGrant';
import { isUuid } from '$lib/data/isUuid';
import { openTaskUploadGrant } from '$lib/server/projects/openTaskUploadGrant';
import { readText } from '../actionTypes';
import { recordGrantedUpload, uploadRecordingStatuses } from '$lib/server/projects/recordGrantedUpload';
import { recordingRefusal } from '$lib/server/projects/recordingRefusal';
import { storeTaskAttachment } from '$lib/server/projects/storeTaskAttachment';
import { validateAttachmentUpload } from '$lib/data/validateAttachmentUpload';
import type { McpCaller } from '../resolveMcpCaller';
import type { McpDataAnswer } from '../mcpContent';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type UploadBoxStep = (
	caller: McpCaller,
	task: ProjectTask,
	input: Record<string, unknown>
) => Promise<McpDataAnswer>;

const notStartedHere = 'That upload was not started from this box.';
const tooBigToRelay =
	`Only a file up to ${describeByteCount(maxInlineAttachmentByteCount)} can travel through the ` +
	'conversation itself.';

function namedFile(input: Record<string, unknown>) {
	return { filename: readText(input, 'filename'), mimeType: readText(input, 'mimeType') };
}

/** Opens a one-time link in storage for a file the box will send there itself. */
export const grantBoxUpload: UploadBoxStep = async (caller, task, input) => {
	const upload = { ...namedFile(input), byteCount: Number(input.byteCount) };
	const problem = validateAttachmentUpload(upload);
	if (problem !== null) return refusedBecause(problem);
	const grant = await openTaskUploadGrant(caller.supabase, task.id, caller.accountId, upload);
	const { grantId: uploadId, uploadUrl } = grant;
	return { data: { outcome: uploadBoxOutcomes.granted, uploadId, uploadUrl } };
};

/** Turns the file the box sent to its link into the task's attachment. */
export const recordBoxUpload: UploadBoxStep = async (caller, task, input) => {
	const uploadId = readText(input, 'uploadId');
	if (!isUuid(uploadId)) return refusedBecause(notStartedHere);
	const grant = await findTaskUploadGrant(caller.supabase, task.id, uploadId, caller.accountId);
	if (grant === null) return refusedBecause(notStartedHere);
	const recording = await recordGrantedUpload(caller.supabase, grant);
	if (recording.status !== uploadRecordingStatuses.recorded) {
		return refusedBecause(recordingRefusal(recording) ?? notStartedHere);
	}
	const { byteCount } = recording;
	return attachedAs({ attachmentId: grant.id, filename: grant.filename, byteCount });
};

/** Takes a small file's bytes through the connector, for a host that will not let the box reach storage. */
export const attachBoxFile: UploadBoxStep = async (caller, task, input) => {
	const bytes = Buffer.from(readText(input, 'contentBase64'), 'base64');
	const upload = { ...namedFile(input), byteCount: bytes.byteLength };
	const problem = validateAttachmentUpload(upload);
	if (problem !== null) return refusedBecause(problem);
	if (upload.byteCount > maxInlineAttachmentByteCount) return refusedBecause(tooBigToRelay);
	const file = { ...upload, bytes };
	const attachmentId = await storeTaskAttachment(caller.supabase, task.id, caller.accountId, file);
	return attachedAs({ attachmentId, filename: upload.filename, byteCount: upload.byteCount });
};
