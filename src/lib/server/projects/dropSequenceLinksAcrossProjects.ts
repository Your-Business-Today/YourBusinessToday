import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Before a family of tasks leaves a project, the sequence links between it and
 * the tasks staying behind are dropped in both directions: a task in the family
 * stops waiting for one outside it, and one outside stops waiting for one
 * inside. Links within the family travel with it.
 */
export async function dropSequenceLinksAcrossProjects(
	supabase: SupabaseClient,
	familyIds: string[]
): Promise<void> {
	const leaving = await supabase
		.from('tasks')
		.update({ waits_for_task_id: null })
		.in('id', familyIds)
		.not('waits_for_task_id', 'is', null)
		.not('waits_for_task_id', 'in', `(${familyIds.join(',')})`);
	if (leaving.error) throw leaving.error;
	const stayingBehind = await supabase
		.from('tasks')
		.update({ waits_for_task_id: null })
		.in('waits_for_task_id', familyIds)
		.not('id', 'in', `(${familyIds.join(',')})`);
	if (stayingBehind.error) throw stayingBehind.error;
}
