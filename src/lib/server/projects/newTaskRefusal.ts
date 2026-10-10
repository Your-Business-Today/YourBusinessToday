import type { SupabaseClient } from '@supabase/supabase-js';
import { newTaskSequenceRefusal } from './newTaskSequenceRefusal';
import { newTaskStoryRefusal } from './newTaskStoryRefusal';
import type { NewTaskSeed } from './createTask';

export async function newTaskRefusal(
	supabase: SupabaseClient,
	projectId: string,
	seed: NewTaskSeed
): Promise<string | null> {
	const storyRefusal = newTaskStoryRefusal(seed);
	if (storyRefusal !== null) return storyRefusal;
	return newTaskSequenceRefusal(supabase, projectId, seed);
}
