import type { SupabaseClient } from '@supabase/supabase-js';

export type TaskBuildable = { isBuildable: boolean; modelNeeded: string | null };

/** Tag a task buildable or not, and name the model it needs (null follows its story points). */
export async function setTaskBuildable(
	supabase: SupabaseClient,
	taskId: string,
	buildable: TaskBuildable
): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({ is_buildable: buildable.isBuildable, model_needed: buildable.modelNeeded })
		.eq('id', taskId);
	if (error) throw error;
}

/** Consideration decides whether a task is buildable; the model it needs is left as it was. */
export async function setTaskBuildableFlag(
	supabase: SupabaseClient,
	taskId: string,
	isBuildable: boolean
): Promise<void> {
	const { error } = await supabase.from('tasks').update({ is_buildable: isBuildable }).eq('id', taskId);
	if (error) throw error;
}
