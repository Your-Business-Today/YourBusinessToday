import { canReachProject } from '../projectAccess';
import { getGoal } from '$lib/server/goals/getGoal';
import { getTask } from '$lib/server/projects/getTask';
import { readOptionalText } from '../actionTypes';
import type { ConversationSubject } from '$lib/server/conversations/conversationSubject';
import type { McpCaller } from '../resolveMcpCaller';

export const noSuchSubject =
	'Name one goal or one task you can reach. Call find_goals or find_tasks on the project first.';

export type ResolvedSubject = {
	subject: ConversationSubject;
	title: string;
	projectId: string;
};

export async function resolveSubject(
	caller: McpCaller,
	input: Record<string, unknown>
): Promise<ResolvedSubject | null> {
	const goalId = readOptionalText(input, 'goalId');
	const taskId = readOptionalText(input, 'taskId');
	if (goalId !== null && taskId !== null) return null;
	if (goalId !== null) return resolveGoalSubject(caller, goalId);
	if (taskId !== null) return resolveTaskSubject(caller, taskId);
	return null;
}

async function resolveGoalSubject(caller: McpCaller, goalId: string): Promise<ResolvedSubject | null> {
	const goal = await getGoal(caller.supabase, goalId);
	if (goal === null || !canReachProject(caller, goal.projectId)) return null;
	const subject = { goalId: goal.id };
	return { subject, title: goal.title, projectId: goal.projectId };
}

async function resolveTaskSubject(caller: McpCaller, taskId: string): Promise<ResolvedSubject | null> {
	const task = await getTask(caller.supabase, taskId);
	if (task === null || !canReachProject(caller, task.projectId)) return null;
	const subject = { taskId: task.id };
	return { subject, title: task.title, projectId: task.projectId };
}
