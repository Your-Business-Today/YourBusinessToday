import {
	designReviewStageName,
	designReviewStates,
	isAwaitingDesignApproval,
	type DesignReviewState
} from '$lib/data/designReview';
import { answerDesignReview } from '$lib/server/designReviews/answerDesignReview';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableTask } from '../projectAccess';
import { noSuchTask } from './describeTask';
import { designReasonField, isDesignTextRefused, validateDesignText } from './designChangeField';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

type AnswerShape = { state: DesignReviewState; isReasonRequired: boolean };

const answerGuidance =
	'YBT’s answer to a request that changes a system’s design, given only on a YBT director’s yes in ' +
	'this chat, after showing them the request, what it changes and the design it changes. Weigh it ' +
	'for the whole system: a single source of truth, the patterns the site already follows, and every ' +
	'other client on it. The answer and its reason are posted on the task, the ask waiting on YBT is ' +
	'settled, and the requester’s Claude brings it to them.';

const answerFields = { taskId: textField('The task id'), reason: designReasonField };

/** YBT staff answer a task waiting in the requested stage, approving or rejecting it. */
async function answerDesignRequest(
	caller: McpCaller,
	input: Record<string, unknown>,
	shape: AnswerShape
): Promise<string> {
	const task = await reachableTask(caller, readText(input, 'taskId'));
	if (task === null) return noSuchTask;
	if (!isAwaitingDesignApproval(task.designReview ?? null)) return `"${task.title}" is not ${designReviewStageName.toLowerCase()}.`;
	const reason = validateDesignText(input, 'reason');
	if (isDesignTextRefused(reason)) return reason.refusal;
	if (shape.isReasonRequired && reason.text === undefined) return 'Give the reason, for whoever asked for it.';
	const answer = { taskId: task.id, state: shape.state, reason: reason.text ?? '', answeredBy: caller.accountId };
	await answerDesignReview(caller.supabase, answer);
	return `"${task.title}": ${shape.state}. The answer is on the task for whoever asked for it.`;
}

export const approveDesignChange: McpAction = {
	name: 'approve_design_change',
	area: 'tasks',
	audience: 'staff',
	isWrite: true,
	summary: 'approve a requested change to a system’s design, so the task can be built',
	guidance: answerGuidance,
	inputSchema: objectSchema(answerFields, ['taskId']),
	run: (caller, input) =>
		answerDesignRequest(caller, input, { state: designReviewStates.approved, isReasonRequired: false })
};

export const rejectDesignChange: McpAction = {
	name: 'reject_design_change',
	area: 'tasks',
	audience: 'staff',
	isWrite: true,
	summary: 'turn a requested change to a system’s design down, with the reason, so it is not built',
	guidance: answerGuidance,
	inputSchema: objectSchema(answerFields, ['taskId', 'reason']),
	run: (caller, input) =>
		answerDesignRequest(caller, input, { state: designReviewStates.rejected, isReasonRequired: true })
};
