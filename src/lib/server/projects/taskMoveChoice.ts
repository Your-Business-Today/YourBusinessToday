import type { SupabaseClient } from '@supabase/supabase-js';
import { getTask } from '$lib/server/projects/getTask';
import { reparentTask } from '$lib/server/projects/reparentTask';

export type TaskMoveChoice =
	| { kind: 'keep' }
	| { kind: 'upOneLevel' }
	| { kind: 'underSibling'; newParentTaskId: string };

export const taskMoveChoiceKinds = {
	keep: 'keep',
	upOneLevel: 'upOneLevel',
	underSibling: 'underSibling'
} as const;

const keepChoiceValue = 'keep';
const upOneLevelChoiceValue = 'up';

export function parseTaskMoveChoice(value: unknown): TaskMoveChoice {
	if (typeof value !== 'string' || value === '' || value === keepChoiceValue) return { kind: 'keep' };
	if (value === upOneLevelChoiceValue) return { kind: 'upOneLevel' };
	return { kind: 'underSibling', newParentTaskId: value };
}

export async function applyTaskMoveChoice(
	supabase: SupabaseClient,
	taskId: string,
	choice: TaskMoveChoice
): Promise<void> {
	if (choice.kind === taskMoveChoiceKinds.keep) return;
	if (choice.kind === taskMoveChoiceKinds.underSibling) return reparentTask(supabase, taskId, choice.newParentTaskId);
	await moveUpOneLevel(supabase, taskId);
}

async function moveUpOneLevel(supabase: SupabaseClient, taskId: string): Promise<void> {
	const task = await getTask(supabase, taskId);
	if (task === null || task.parentTaskId === null) return;
	const parentTask = await getTask(supabase, task.parentTaskId);
	if (parentTask === null) return;
	await reparentTask(supabase, taskId, parentTask.parentTaskId);
}
