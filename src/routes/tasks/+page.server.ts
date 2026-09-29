import { getGlobalTaskPage, singlePageOf } from '$lib/server/projects/getGlobalTaskPage';
import { getAssignedTasks } from '$lib/server/projects/getAssignedTasks';
import { requireUser } from '$lib/server/auth/requireUser';
import { taskQueueActions } from './taskQueueActions';
import {
	filterForAssignedTasks,
	filterForEveryTask,
	parseTaskListFilter,
	type TaskListFilter
} from '$lib/data/taskListFilter';
import type { GlobalTaskPage } from '$lib/server/projects/getGlobalTaskPage';
import type { PageServerLoad } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = await requireUser(locals);
	const filter = parseTaskListFilter(url.searchParams.get('status'));
	const pageNumber = readPageNumber(url.searchParams.get('page'));
	return { taskPage: await pageFor(locals.supabase, user.id, filter, pageNumber), filter };
};

export const actions = taskQueueActions;

async function pageFor(
	supabase: SupabaseClient,
	accountId: string,
	filter: TaskListFilter,
	pageNumber: number
): Promise<GlobalTaskPage> {
	if (filter === filterForAssignedTasks) {
		const assignedTasks = await getAssignedTasks(supabase, accountId);
		return singlePageOf(assignedTasks);
	}
	const shouldIncludeDone = filter === filterForEveryTask;
	return getGlobalTaskPage(supabase, accountId, pageNumber, shouldIncludeDone);
}

function readPageNumber(value: string | null): number {
	const parsed = Number(value);
	if (!Number.isInteger(parsed) || parsed < 1) return 1;
	return parsed;
}
