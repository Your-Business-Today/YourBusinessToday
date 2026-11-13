import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { setTaskAssignees } from './setTaskAssignees';
import type { ProjectTask } from './taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export const assigneeOffProject = 'Only people on the project can own an item. Add them to the project first.';

/** Puts the people chosen on the task, when every one of them is on its project; says false and changes nothing when one is not. */
export async function assignTaskOnProject(supabase: SupabaseClient, task: ProjectTask, chosenIds: string[]): Promise<boolean> {
	const people = await getPeopleOnProject(supabase, task.projectId);
	const peopleIds = people.map((person) => person.id);
	const isEveryoneOnProject = chosenIds.every((chosenId) => peopleIds.includes(chosenId));
	if (!isEveryoneOnProject) return false;
	await setTaskAssignees(supabase, task.id, chosenIds);
	return true;
}
