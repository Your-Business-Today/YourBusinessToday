import { designReviewStageName } from '$lib/data/designReview';
import { findDesignRequests, type DesignRequestOnBoard } from '$lib/server/designReviews/findDesignRequests';
import { objectSchema, readOptionalText, textField } from '../actionTypes';
import { canReachProject, noReachableProject, reachableProjectIds } from '../projectAccess';
import type { McpAction } from '../actionTypes';

const nothingWaiting = `Nothing is ${designReviewStageName.toLowerCase()}.`;

export const designRequestsAction: McpAction = {
	name: 'list_design_requests',
	area: 'tasks',
	audience: 'staff',
	isWrite: false,
	summary: `the tasks ${designReviewStageName.toLowerCase()}, oldest first, with what each changes`,
	guidance:
		'Read each with read_task before answering it, and put it to a YBT director one at a time; ' +
		'approve_design_change or reject_design_change records their answer.',
	inputSchema: objectSchema({ projectId: textField('Narrow to one project — leave out for every project you are on') }),
	run: async (caller, input) => {
		const projectId = readOptionalText(input, 'projectId');
		if (projectId !== null && !canReachProject(caller, projectId)) return noReachableProject;
		const projectIds = projectId === null ? reachableProjectIds(caller) : [projectId];
		const requests = await findDesignRequests(caller.supabase, projectIds);
		if (requests.length === 0) return nothingWaiting;
		return requests.map(requestLine).join('\n');
	}
};

function requestLine(request: DesignRequestOnBoard): string {
	const { task, projectName } = request;
	const change = task.designReview?.change ?? '';
	return `- ${projectName}: "${task.title}" (task id: ${task.id}). What it changes: ${change}`;
}
