import { bugsFirst } from '$lib/data/bugsFirst';
import { getAssignedTasks } from '$lib/server/projects/getAssignedTasks';
import { getQuestionsWaitingOn } from '$lib/server/conversations/getQuestionsWaitingOn';
import { getTasksNamingPerson } from '$lib/server/projects/getTasksNamingPerson';
import { getTodosOwnedBy } from '$lib/server/todos/getTodos';
import { isTodoOpen } from '$lib/data/todo';
import type { GlobalTask } from '$lib/server/projects/getGlobalTaskPage';
import type { OwingPerson } from './owingPerson';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Todo } from '$lib/server/todos/todoRecord';
import type { WaitingQuestion } from '$lib/server/conversations/waitingQuestion';

/**
 * Everything one person owes on a set of projects, bugs first in each part: the asks waiting on
 * them, the open tasks assigned to them, the open tasks whose title names them, and their open
 * to-dos. The YBT summary, the list of what waits on someone and who to chase all read this one
 * answer, so they never disagree about what a person owes.
 */
export type WhatPersonOwes = {
	person: OwingPerson;
	questions: WaitingQuestion[];
	assigned: GlobalTask[];
	named: GlobalTask[];
	todos: Todo[];
};

export async function getWhatPersonOwes(
	supabase: SupabaseClient,
	person: OwingPerson,
	projectIds: string[]
): Promise<WhatPersonOwes> {
	const isOnTheseProjects = (projectId: string | null) => projectIds.includes(projectId ?? '');
	const { accountIds } = person;
	const [everyQuestion, everyAssigned, everyNamed, everyTodo] = await Promise.all([
		readAcrossLogins(accountIds, (accountId) => getQuestionsWaitingOn(supabase, accountId)),
		readAcrossLogins(accountIds, (accountId) => getAssignedTasks(supabase, accountId)),
		getTasksNamedFor(supabase, projectIds, person),
		readAcrossLogins(accountIds, (accountId) => getTodosOwnedBy(supabase, accountId))
	]);
	const questions = everyQuestion.filter((question) => isOnTheseProjects(question.projectId));
	const assigned = everyAssigned.filter((task) => isOnTheseProjects(task.projectId));
	const assignedIds = new Set(assigned.map((task) => task.id));
	const named = everyNamed.filter((task) => !assignedIds.has(task.id));
	return {
		person,
		questions: bugsFirst(questions, (question) => question.subjectTitle),
		assigned: bugsFirst(assigned, taskTitle),
		named: bugsFirst(named, taskTitle),
		todos: everyTodo.filter((todo) => isTodoOpen(todo.status))
	};
}

/** What one read finds for each of a person's logins, each record once however many logins find it. */
async function readAcrossLogins<Found extends { id: string }>(
	accountIds: string[],
	read: (accountId: string) => Promise<Found[]>
): Promise<Found[]> {
	const foundPerLogin = await Promise.all(accountIds.map(read));
	const byId = new Map(foundPerLogin.flat().map((found) => [found.id, found]));
	return [...byId.values()];
}

async function getTasksNamedFor(
	supabase: SupabaseClient,
	projectIds: string[],
	person: OwingPerson
): Promise<GlobalTask[]> {
	if (person.titleName === null) return [];
	return getTasksNamingPerson(supabase, projectIds, person.titleName);
}

function taskTitle(task: GlobalTask): string {
	return task.title;
}
