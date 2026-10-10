import { reachableTask } from '../projectAccess';
import { deleteTaskAttachment } from '$lib/server/projects/deleteTaskAttachment';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { findNamedAttachment } from './findNamedAttachment';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { parseAttachmentFileInput } from './parseAttachmentFileInput';
import { storeTaskAttachment } from '$lib/server/projects/storeTaskAttachment';
import type { McpAction } from '../actionTypes';

const taskIdField = textField('The task id');

export const taskAttachmentWriteActions: McpAction[] = [
	{
		name: 'attach_file_to_task',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'attach a file to a task, from a web address or from base64 content',
		guidance:
			'Give sourceUrl or contentBase64, not both. Anything up to 25 MB works through ' +
			'sourceUrl, which the server downloads itself. contentBase64 is for tiny files only: ' +
			'the request as a whole is capped at about 4.5 MB, and typing bytes out as base64 is ' +
			'slow and easily corrupts them. For a file in your own workspace, call grant_task_upload ' +
			'instead and send it with one HTTP PUT. For a file only the person holds, such as an ' +
			'image they pasted into the chat, call the tool show_task_upload_box.',
		inputSchema: objectSchema(
			{
				taskId: taskIdField,
				sourceUrl: textField('A public http(s) address the server can download the file from'),
				contentBase64: textField('The file bytes, base64 encoded — small files only'),
				filename: textField('What to call the file — taken from the address when left out'),
				mimeType: textField(
					'The file type, such as application/pdf — taken from the download when left out'
				)
			},
			['taskId']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const file = await parseAttachmentFileInput(input);
			if (typeof file === 'string') return file;
			const attachmentId = await storeTaskAttachment(
				caller.supabase,
				task.id,
				caller.accountId,
				file
			);
			const attached = `"${file.filename}" (${describeByteCount(file.byteCount)})`;
			return `${attached} attached to "${task.title}" (attachment id: ${attachmentId}).`;
		}
	},
	{
		name: 'remove_task_attachment',
		area: 'tasks',
		audience: 'everyone',
		isWrite: true,
		summary: 'remove a file from a task',
		guidance: 'This permanently deletes the file. It cannot be undone.',
		inputSchema: objectSchema(
			{ taskId: taskIdField, attachmentId: textField('The attachment id, as read_task lists it') },
			['taskId', 'attachmentId']
		),
		run: async (caller, input) => {
			const named = await findNamedAttachment(caller, input);
			if (typeof named === 'string') return named;
			const { task, attachment } = named;
			await deleteTaskAttachment(caller.supabase, attachment);
			return `"${attachment.filename}" removed from "${task.title}".`;
		}
	}
];
