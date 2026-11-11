import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { setTaskAssignees } from './setTaskAssignees';
import type { SupabaseClient } from '@supabase/supabase-js';

export const ownerNotOnProjectRefusal = 'The owner must be someone on the project: choose them from the list.';

export type NewTaskOwner = { ownerIds: string[]; refusal: null } | { ownerIds: null; refusal: string };

/** Who a new task is given to, from its form's owner: nobody when none is chosen, refused when they are not on the project. */
export async function readNewTaskOwner(
	supabase: SupabaseClient,
	projectId: string,
	formData: FormData
): Promise<NewTaskOwner> {
	const ownerId = String(formData.get('ownerId') ?? '').trim();
	if (ownerId === '') return { ownerIds: [], refusal: null };
	const people = await getPeopleOnProject(supabase, projectId);
	const isOnProject = people.some((person) => person.id === ownerId);
	if (!isOnProject) return { ownerIds: null, refusal: ownerNotOnProjectRefusal };
	return { ownerIds: [ownerId], refusal: null };
}

export async function giveNewTaskToOwner(supabase: SupabaseClient, taskId: string, ownerIds: string[]): Promise<void> {
	if (ownerIds.length === 0) return;
	await setTaskAssignees(supabase, taskId, ownerIds);
}
