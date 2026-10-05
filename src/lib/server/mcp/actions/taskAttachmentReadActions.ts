import { reachableTask } from '../projectAccess';
import { answerWithStoredFile } from './storedFileAnswer';
import { characterCap } from './attachmentAnswers';
import { describeByteCount, maxInlineAttachmentByteCount } from '$lib/data/taskAttachmentRules';
import { findTaskAttachment } from '$lib/server/projects/findTaskAttachment';
import { noSuchAttachment } from './describeAttachments';
import { noSuchTask } from './describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const inlineCap = describeByteCount(maxInlineAttachmentByteCount);

export const taskAttachmentReadActions: McpAction[] = [
	{
		name: 'read_task_attachment',
		area: 'tasks',
		audience: 'everyone',
		isWrite: false,
		summary: 'open one attachment on a task — its text, the image itself, or the file',
		guidance:
			'Text, markdown, CSV, JSON and Word files come back as their text; PDFs as their text ' +
			'with a marker before each page; spreadsheets as CSV, one block per sheet — all cut off ' +
			`at ${characterCap} characters. Images up to ${inlineCap} come back as the image and other ` +
			`files up to ${inlineCap} as the file itself, so nothing needs fetching. Anything bigger, or a PDF ` +
			'with no text layer, comes back as a link that works for ten minutes.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task id'),
				attachmentId: textField('The attachment id, as read_task lists it')
			},
			['taskId', 'attachmentId']
		),
		run: async (caller, input) => {
			const task = await reachableTask(caller, readText(input, 'taskId'));
			if (task === null) return noSuchTask;
			const attachment = await findTaskAttachment(
				caller.supabase,
				task.id,
				readText(input, 'attachmentId')
			);
			if (attachment === null) return noSuchAttachment;
			return answerWithStoredFile(caller.supabase, attachment);
		}
	}
];
