import { isUuid } from '$lib/data/isUuid';
import { noSuchTask } from '../actions/describeTask';
import { objectSchema, readText, textField } from '../actionTypes';
import { openTaskUploadPage } from '$lib/server/projects/openTaskUploadPage';
import { performUploadBoxStep } from './uploadBoxSteps';
import { reachableTask } from '../projectAccess';
import { uploadBoxResource } from './uploadBoxResource';
import { uploadBoxSentence } from './uploadBoxSentence';
import { showUploadBoxToolName, uploadBoxStepNames, uploadBoxStepToolName } from './uploadBoxNames';
import type { McpCaller } from '../resolveMcpCaller';
import type { McpTool } from '../mcpTools';

const { uri: uploadBoxPage } = uploadBoxResource;

const stepField = {
	type: 'string',
	enum: uploadBoxStepNames,
	description: 'Which step of sending a file this is'
};

/** Opens the box on one task. The host draws it from this tool's page; the answer is what to tell the person. */
async function showTaskUploadBox(
	caller: McpCaller,
	argumentValues: Record<string, unknown>
): Promise<string> {
	const taskId = readText(argumentValues, 'taskId');
	if (!isUuid(taskId)) return noSuchTask;
	const task = await reachableTask(caller, taskId);
	if (task === null) return noSuchTask;
	return uploadBoxSentence(task, openTaskUploadPage(task.id, caller.accountId));
}

/**
 * The two tools beside the four that run actions. A host draws a page for a tool, never for an
 * action, so the box needs a tool of its own to be shown by, and one more that it alone calls.
 */
export const uploadBoxTools: McpTool[] = [
	{
		name: showUploadBoxToolName,
		title: 'Show the upload box for a task',
		description:
			'Show the person a box in the conversation where they drop, paste or choose files to put ' +
			'on a task. Use it for any image or file only they hold: one they pasted here, which you ' +
			'can see but cannot pass on, or one your own network will not let you send. Never type a ' +
			'file out as base64. Where the host draws no box, the answer carries a link that does the ' +
			'same in their browser.',
		inputSchema: objectSchema({ taskId: textField('The task the files are for') }, ['taskId']),
		annotations: { readOnlyHint: true },
		meta: {
			ui: { resourceUri: uploadBoxPage, visibility: ['model', 'app'] },
			'ui/resourceUri': uploadBoxPage
		},
		run: showTaskUploadBox
	},
	{
		name: uploadBoxStepToolName,
		title: 'Carry a file from the upload box',
		description:
			'Called by the upload box itself, never by you: one step of sending a file the person ' +
			'chose there. To put a file on a task yourself, call perform_action with grant_task_upload ' +
			'or attach_file_to_task; to let the person add one, call show_task_upload_box.',
		inputSchema: objectSchema(
			{
				taskId: textField('The task the box was opened on'),
				step: stepField,
				filename: textField('What the file is called'),
				mimeType: textField('The file type, such as image/png'),
				byteCount: { type: 'integer', description: 'How big the file is, in bytes' },
				uploadId: textField('The upload a grant step opened'),
				contentBase64: textField('The file itself, base64 encoded, when it travels through the connector')
			},
			['taskId', 'step']
		),
		annotations: { readOnlyHint: false, destructiveHint: false },
		meta: { ui: { visibility: ['app'] } },
		run: performUploadBoxStep
	}
];
