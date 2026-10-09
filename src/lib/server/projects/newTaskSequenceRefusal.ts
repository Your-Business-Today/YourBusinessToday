import type { SupabaseClient } from '@supabase/supabase-js';
import { getTask } from '$lib/server/projects/getTask';
import type { NewTaskSeed } from '$lib/server/projects/createTask';

export const waitsForTaskElsewhere =
	'A task waits for a task on its own project — the task named is not on this one.';

/** Why a new task cannot wait for the task its seed names, or null when it can. */
export async function newTaskSequenceRefusal(
	supabase: SupabaseClient,
	projectId: string,
	seed: NewTaskSeed
): Promise<string | null> {
	if (seed.waitsForTaskId === null) return null;
	const waitedFor = await getTask(supabase, seed.waitsForTaskId);
	if (waitedFor === null || waitedFor.projectId !== projectId) return waitsForTaskElsewhere;
	return null;
}
