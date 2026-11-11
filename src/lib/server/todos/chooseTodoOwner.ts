import { findProjectPerson } from '$lib/server/members/findProjectPerson';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { isNobodyNamed } from '$lib/data/batonRule';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Todo } from './todoRecord';

export type TodoOwnerChoice = { ownerAccountId: string | null };

export const todoOwnerOffProject = 'That person is not on the to-do’s project. Call list_project_people.';
export const todoOwnerNeedsAProject =
	'Only a to-do under a task can be handed to someone else: this one is on its owner’s own list.';

/** Whose a to-do under a task becomes: someone on its project, or nobody, for anyone on the project to take. */
export async function chooseTodoOwner(
	supabase: SupabaseClient,
	todo: Todo,
	owner: string
): Promise<TodoOwnerChoice | string> {
	if (todo.projectId === null) return todoOwnerNeedsAProject;
	if (isNobodyNamed(owner)) return { ownerAccountId: null };
	const people = await getPeopleOnProject(supabase, todo.projectId);
	const person = findProjectPerson(people, owner);
	if (person === null) return todoOwnerOffProject;
	return { ownerAccountId: person.id };
}
