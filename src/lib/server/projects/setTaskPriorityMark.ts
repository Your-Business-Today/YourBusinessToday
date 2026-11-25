import type { SupabaseClient } from '@supabase/supabase-js';
import { priorityMarkPlace } from '$lib/data/priorityMark';
import { setTaskPriority } from './setTaskPriority';

/** Mark a task as priority, putting it first among the tasks beside it, or take the mark off. */
export async function setTaskPriorityMark(
	supabase: SupabaseClient,
	taskId: string,
	isPriority: boolean
): Promise<void> {
	const { data, error } = await supabase
		.from('tasks')
		.update({ is_priority: isPriority })
		.eq('id', taskId)
		.select('id');
	if (error) throw error;
	if (data.length === 0) throw new Error('The priority mark was not saved: no task you may change has that id.');
	if (isPriority) await setTaskPriority(supabase, taskId, priorityMarkPlace);
}
