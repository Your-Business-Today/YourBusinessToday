import { noReachableProject, ownsProject, reachableProject } from '../projectAccess';
import { countSupportTasksRaisedToday, dailyRaiseCeiling } from '$lib/server/support/raiseCeiling';
import { createSupportTask } from '$lib/server/support/createSupportTask';
import { getGoal } from '$lib/server/goals/getGoal';
import { getTask } from '$lib/server/projects/getTask';
import { longestMessageBody } from '$lib/server/conversations/postMessage';
import { readOptionalText, readText } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

const ownerRole = 'owner of the project';
const memberRole = 'member of the project';

export async function raiseSupportTask(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<string> {
	const project = await reachableProject(caller, readText(input, 'projectId'));
	if (project === null) return noReachableProject;
	const title = readOptionalText(input, 'title');
	const want = readOptionalText(input, 'want');
	if (title === null || want === null)
		return 'Say what the matter is in a sentence, then in your own words.';
	const refusal = await refusalFor(caller, want);
	if (refusal !== null) return refusal;
	const placement = await placementWithin(caller, project.id, input);
	if (placement === null)
		return 'That goal or parent task is not on this project. Call find_goals or find_tasks first.';
	const taskId = await createSupportTask(
		caller.supabase,
		project,
		{
			...placement,
			title,
			want,
			benefit: readText(input, 'benefit'),
			raiserRole: roleOf(caller, project.id)
		},
		caller.accountId
	);
	return `Raised "${title}" on ${project.name} (task id: ${taskId}). Someone will answer in its conversation.`;
}

/** Why the want cannot be raised as it stands: too long, or the day's ceiling reached. */
async function refusalFor(caller: McpCaller, want: string): Promise<string | null> {
	if (want.length > longestMessageBody) {
		return `That is too long — keep it under ${longestMessageBody} characters and link to the detail instead.`;
	}
	const raisedToday = await countSupportTasksRaisedToday(caller.supabase, caller.accountId);
	if (raisedToday >= dailyRaiseCeiling) {
		return `You have raised ${raisedToday} today, which is the daily limit. Add to an open task instead, or try again tomorrow.`;
	}
	return null;
}

type Placement = { goalId: string | null; parentTaskId: string | null };

async function placementWithin(
	caller: McpCaller,
	projectId: string,
	input: Record<string, unknown>
): Promise<Placement | null> {
	const goalId = readOptionalText(input, 'goalId');
	const parentTaskId = readOptionalText(input, 'parentTaskId');
	if (goalId !== null && !(await isGoalOn(caller, goalId, projectId))) return null;
	if (parentTaskId !== null && !(await isTaskOn(caller, parentTaskId, projectId))) return null;
	return { goalId, parentTaskId };
}

async function isGoalOn(caller: McpCaller, goalId: string, projectId: string): Promise<boolean> {
	const goal = await getGoal(caller.supabase, goalId);
	return goal !== null && goal.projectId === projectId;
}

async function isTaskOn(caller: McpCaller, taskId: string, projectId: string): Promise<boolean> {
	const task = await getTask(caller.supabase, taskId);
	return task !== null && task.projectId === projectId;
}

function roleOf(caller: McpCaller, projectId: string): string {
	if (ownsProject(caller, projectId)) return ownerRole;
	return memberRole;
}
