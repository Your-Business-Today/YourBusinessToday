import { getAssigneeIdsByTask } from '$lib/server/projects/getAssigneeIdsByTask';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTodosByTask } from '$lib/server/todos/getTodosByTask';
import { isInternalWork } from '$lib/data/boardSide';
import type { InternalItemFacts } from './describeInternalItems';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What read_project says about each Internal work item beyond the task itself: whose it is and its to-dos. */
export async function readInternalItemFacts(
	supabase: SupabaseClient,
	projectId: string,
	tasks: ProjectTask[]
): Promise<InternalItemFacts> {
	const internalTaskIds = tasks.filter((task) => isInternalWork(task.department)).map((task) => task.id);
	const [people, assigneeIdsByTask, todosByTask] = await Promise.all([
		getPeopleOnProject(supabase, projectId),
		getAssigneeIdsByTask(supabase, internalTaskIds),
		getTodosByTask(supabase, internalTaskIds)
	]);
	return { people, assigneeIdsByTask, todosByTask };
}
