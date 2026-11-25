import { designReviewStageName, isAwaitingDesignApproval } from '$lib/data/designReview';
import { askForDesignApproval } from '$lib/server/designReviews/askForDesignApproval';
import { holdForDesignReview } from '$lib/server/designReviews/holdForDesignReview';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableTaskWithProject } from '../projectAccess';
import { noSuchTask } from './describeTask';
import { designChangeField, isDesignTextRefused, validateDesignText } from './designChangeField';
import { approveDesignChange, rejectDesignChange } from './designAnswerAction';
import { designRequestsAction } from './designRequestsAction';
import type { McpAction } from '../actionTypes';

const requestApproval: McpAction = {
	name: 'request_design_approval',
	area: 'tasks',
	audience: 'everyone',
	isWrite: true,
	summary: `put a task already raised into ${designReviewStageName}, because it changes the system's design`,
	guidance:
		'For a task on the board that turns out to change the design — a new way of doing what the system ' +
		'already does, the same fact kept in a second place, a rule worked around — once you have pushed ' +
		'back and the person still wants it. Nothing builds it until YBT approves it.',
	inputSchema: objectSchema(
		{ taskId: textField('The task id'), designChange: designChangeField },
		['taskId', 'designChange']
	),
	run: async (caller, input) => {
		const found = await reachableTaskWithProject(caller, readText(input, 'taskId'));
		if (found === null) return noSuchTask;
		const change = validateDesignText(input, 'designChange');
		if (isDesignTextRefused(change)) return change.refusal;
		if (change.text === undefined) return 'Say what the request changes in designChange. Nothing was changed.';
		if (isAwaitingDesignApproval(found.task.designReview ?? null)) return `"${found.task.title}" already waits for YBT.`;
		await holdForDesignReview(caller.supabase, found.task.id, change.text);
		const request = { taskId: found.task.id, raisedBy: caller.accountId, change: change.text };
		await askForDesignApproval(caller.supabase, found.project, request);
		return `"${found.task.title}" is now ${designReviewStageName}: nothing builds it until YBT approves it.`;
	}
};

export const designReviewActions: McpAction[] = [requestApproval, designRequestsAction, approveDesignChange, rejectDesignChange];
