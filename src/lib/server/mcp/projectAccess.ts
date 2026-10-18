import { getGoal } from '$lib/server/goals/getGoal';
import { getProject } from '$lib/server/projects/getProject';
import { getTask } from '$lib/server/projects/getTask';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { McpCaller } from './resolveMcpCaller';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export const noReachableProject =
	'No project you are on has that id. Call list_projects for the ones you own and the ones you are on.';
export const notTheOwner =
	'Only the owner of a project can do that. Call list_projects to see which projects are yours.';

export function canReachProject(caller: McpCaller, projectId: string): boolean {
	return ownsProject(caller, projectId) || caller.memberProjectIds.includes(projectId);
}

export function ownsProject(caller: McpCaller, projectId: string): boolean {
	return caller.ownedProjectIds.includes(projectId);
}

export function reachableProjectIds(caller: McpCaller): string[] {
	return [...caller.ownedProjectIds, ...caller.memberProjectIds];
}

export async function reachableProject(
	caller: McpCaller,
	projectId: string
): Promise<Project | null> {
	if (!canReachProject(caller, projectId)) return null;
	return getProject(caller.supabase, projectId);
}

export async function ownedProject(caller: McpCaller, projectId: string): Promise<Project | null> {
	if (!ownsProject(caller, projectId)) return null;
	return getProject(caller.supabase, projectId);
}

export async function reachableTask(
	caller: McpCaller,
	taskId: string
): Promise<ProjectTask | null> {
	const task = await getTask(caller.supabase, taskId);
	if (task === null || !canReachProject(caller, task.projectId)) return null;
	return task;
}

export async function reachableTaskWithProject(
	caller: McpCaller,
	taskId: string
): Promise<{ task: ProjectTask; project: Project } | null> {
	const task = await reachableTask(caller, taskId);
	if (task === null) return null;
	const project = await reachableProject(caller, task.projectId);
	if (project === null) return null;
	return { task, project };
}

export async function reachableGoal(caller: McpCaller, goalId: string): Promise<Goal | null> {
	const goal = await getGoal(caller.supabase, goalId);
	if (goal === null || !canReachProject(caller, goal.projectId)) return null;
	return goal;
}
