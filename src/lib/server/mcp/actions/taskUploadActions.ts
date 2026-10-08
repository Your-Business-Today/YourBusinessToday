import { reachableTask } from '../projectAccess';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { describeUploadGrant, noSuchUploadGrant } from './describeUploadGrant';
import { findTaskUploadGrant } from '$lib/server/projects/findTaskUploadGrant';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { openTaskUploadGrant } from '$lib/server/projects/openTaskUploadGrant';
import { readUploadDescription } from './readUploadDescription';
import { recordGrantedUpload, uploadRecordingStatuses } from '$lib/server/projects/recordGrantedUpload';
import { uploadLinkLifetimeMinutes } from '$lib/server/projects/uploadGrantRecord';
import type { McpAction } from '../actionTypes';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { TaskUploadGrant } from '$lib/server/projects/uploadGrantRecord';

const taskIdField = textField('The task id');

export const taskUploadActions: McpAction[] = [
	{
		name: 'grant_task_upload',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'get a one-time link to send a file from your own workspace to a task',
		guidance:
			'For a file you hold locally — a screenshot, an export — that is bigger than a few ' +
			'kilobytes or not at a public address. The link takes one HTTP PUT of up to 25 MB and ' +
			`expires after ${uploadLinkLifetimeMinutes} minutes; the answer gives the command. Send the ` +
			'file, then call record_task_upload with the uploadId so it appears on the task, under you. ' +
			'Where your own network refuses the PUT, retrying will not help: call the tool ' +
			'show_task_upload_box and the person adds the file themselves.',
		inputSchema: objectSchema(
			{
				taskId: taskIdField,
				filename: textField('What the file will be called on the task, such as invoice-rounding-screenshot.png'),
				mimeType: textField('The file type, such as image/png or application/pdf')
			},
			['taskId', 'filename', 'mimeType']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const upload = readUploadDescription(input);
			if (typeof upload === 'string') return upload;
			const grant = await openTaskUploadGrant(caller.supabase, task.id, caller.accountId, upload);
			return describeUploadGrant(task, upload, grant);
		}
	},
	{
		name: 'record_task_upload',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'record the file sent to an upload link as the task’s attachment',
		guidance:
			'Call this once the PUT to a link from grant_task_upload has succeeded. The file is ' +
			'recorded under the person the link was granted to, at the size that actually arrived.',
		inputSchema: objectSchema(
			{ taskId: taskIdField, uploadId: textField('The uploadId grant_task_upload gave') },
			['taskId', 'uploadId']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const grant = await findTaskUploadGrant(
				caller.supabase,
				task.id,
				readText(input, 'uploadId'),
				caller.accountId
			);
			if (grant === null) return noSuchUploadGrant;
			return recordingSentence(task, grant, await recordGrantedUpload(caller.supabase, grant));
		}
	}
];

function recordingSentence(
	task: ProjectTask,
	grant: TaskUploadGrant,
	recording: Awaited<ReturnType<typeof recordGrantedUpload>>
): string {
	if (recording.status === uploadRecordingStatuses.recorded) {
		const attached = `"${grant.filename}" (${describeByteCount(recording.byteCount)})`;
		return `${attached} attached to "${task.title}" (attachment id: ${grant.id}).`;
	}
	if (recording.status === uploadRecordingStatuses.fileMissing) {
		return 'Nothing has arrived at that link yet. Send the file with the PUT first, then call again.';
	}
	if (recording.status === uploadRecordingStatuses.expired) {
		return `That link expired ${uploadLinkLifetimeMinutes} minutes after it was granted, and anything sent to it since was discarded. Call grant_task_upload for a fresh one.`;
	}
	return 'That link has already been used, so the file is on the task. Call read_task to see it.';
}
