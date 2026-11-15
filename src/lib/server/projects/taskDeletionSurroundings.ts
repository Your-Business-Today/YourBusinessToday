import type { SupabaseClient } from '@supabase/supabase-js';
import type { TaskDeletion } from './taskDeletionReading';

/** The projects among these that still stand. A project deleted whole is not among them. */
export async function findStandingProjectIds(supabase: SupabaseClient, projectIds: string[]): Promise<Set<string>> {
	const distinctIds = [...new Set(projectIds)];
	if (distinctIds.length === 0) return new Set();
	const { data, error } = await supabase.from('projects').select('id').in('id', distinctIds);
	if (error !== null) throw error;
	return new Set((data as { id: string }[]).map((project) => project.id));
}

/** What each deleted task was under, by its parent's id: a task that still stands, or one deleted alongside it. */
export async function findParentTitles(
	supabase: SupabaseClient,
	deletions: TaskDeletion[]
): Promise<Map<string, string>> {
	const titles = new Map(deletions.map((deletion) => [deletion.taskId, deletion.title]));
	const parentIds = [
		...new Set(deletions.map((deletion) => deletion.parentTaskId).filter((parentId) => parentId !== null))
	];
	const standingIds = parentIds.filter((parentId) => !titles.has(parentId));
	if (standingIds.length === 0) return titles;
	const { data, error } = await supabase.from('tasks').select('id, title').in('id', standingIds);
	if (error !== null) throw error;
	for (const parent of data as { id: string; title: string }[]) titles.set(parent.id, parent.title);
	return titles;
}
