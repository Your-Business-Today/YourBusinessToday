import { attachBoxFile, grantBoxUpload, recordBoxUpload, type UploadBoxStep } from './uploadBoxFileSteps';
import {
	describeByteCount,
	maxAttachmentByteCount,
	maxInlineAttachmentByteCount
} from '$lib/data/taskAttachmentRules';
import { isUuid } from '$lib/data/isUuid';
import { openTaskUploadPage } from '$lib/server/projects/openTaskUploadPage';
import { reachableTask } from '../projectAccess';
import { readText } from '../actionTypes';
import { refusedBecause, uploadBoxOutcomes } from './uploadBoxOutcomes';
import type { McpCaller } from '../resolveMcpCaller';
import type { McpDataAnswer } from '../mcpContent';
import type { UploadBoxStepName } from './uploadBoxNames';

const noSuchStep = 'The upload box asked for a step that does not exist.';
const taskOutOfReach = 'That task could not be found, or you are not on its project.';

/** Tells the box which task it serves, how big a file may be, and the page to offer when it cannot send one. */
const openBox: UploadBoxStep = async (caller, task) => ({
	data: {
		outcome: uploadBoxOutcomes.opened,
		taskTitle: task.title,
		uploadPage: openTaskUploadPage(task.id, caller.accountId),
		largestFile: describeByteCount(maxAttachmentByteCount),
		largestFileBytes: maxAttachmentByteCount,
		largestRelayedFileBytes: maxInlineAttachmentByteCount
	}
});

const stepsByName: Record<UploadBoxStepName, UploadBoxStep> = {
	open: openBox,
	grant: grantBoxUpload,
	record: recordBoxUpload,
	attach: attachBoxFile
};

export async function performUploadBoxStep(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<McpDataAnswer> {
	const stepName = readText(input, 'step');
	if (!isStepName(stepName)) return refusedBecause(noSuchStep);
	const taskId = readText(input, 'taskId');
	if (!isUuid(taskId)) return refusedBecause(taskOutOfReach);
	const task = await reachableTask(caller, taskId);
	if (task === null) return refusedBecause(taskOutOfReach);
	const step = stepsByName[stepName];
	return step(caller, task, input);
}

function isStepName(candidate: string): candidate is UploadBoxStepName {
	return Object.hasOwn(stepsByName, candidate);
}
