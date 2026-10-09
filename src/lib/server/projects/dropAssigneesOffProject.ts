import type { SupabaseClient } from '@supabase/supabase-js';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';

/**
 * A task arriving on a project can only be worked by the people on it, so
 * anyone assigned who is a stranger there stops being an assignee.
 */
export async function dropAssigneesOffProject(
	supabase: SupabaseClient,
	taskIds: string[],
	projectId: string
): Promise<void> {
	const strangers = await assigneesNotOnProject(supabase, taskIds, projectId);
	if (strangers.length === 0) return;
	const { error } = await supabase
		.from('task_assignees')
		.delete()
		.in('task_id', taskIds)
		.in('profile_id', strangers);
	if (error) throw error;
}

async function assigneesNotOnProject(
	supabase: SupabaseClient,
	taskIds: string[],
	projectId: string
): Promise<string[]> {
	const [assignedIds, people] = await Promise.all([
		assignedProfileIds(supabase, taskIds),
		getPeopleOnProject(supabase, projectId)
	]);
	const idsOnProject = people.map((person) => person.id);
	return assignedIds.filter((profileId) => !idsOnProject.includes(profileId));
}

async function assignedProfileIds(
	supabase: SupabaseClient,
	taskIds: string[]
): Promise<string[]> {
	const { data, error } = await supabase
		.from('task_assignees')
		.select('profile_id')
		.in('task_id', taskIds);
	if (error) throw error;
	return [...new Set(data.map((row: Record<string, unknown>) => row.profile_id as string))];
}
