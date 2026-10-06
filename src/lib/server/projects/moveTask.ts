import type { SupabaseClient } from '@supabase/supabase-js';
import { siblingsOf } from '$lib/server/projects/taskSiblings';
import { getTask } from '$lib/server/projects/getTask';
import { moveByOne } from '$lib/server/ordering/rankedScope';
import type { MoveDirection } from '$lib/server/ordering/rankedSet';

export type TaskMoveDirection = MoveDirection;

export async function moveTask(
	supabase: SupabaseClient,
	taskId: string,
	direction: TaskMoveDirection
): Promise<void> {
	const task = await getTask(supabase, taskId);
	if (task === null) return;
	await moveByOne(siblingsOf(supabase, task), task.id, direction);
}
