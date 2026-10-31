import { requireUser } from '$lib/server/auth/requireUser';
import { getReachableProjectIds } from '$lib/server/projects/getReachableProjectIds';
import { getTodosOwnedBy, getUntakenTodos } from '$lib/server/todos/getTodos';
import { getAssignedTasks } from '$lib/server/projects/getAssignedTasks';
import { todoFormActions } from '$lib/server/todos/todoFormActions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const projectIds = await getReachableProjectIds(locals.supabase, user.id);
	const [tasks, todos, untakenTodos] = await Promise.all([
		getAssignedTasks(locals.supabase, user.id),
		getTodosOwnedBy(locals.supabase, user.id),
		getUntakenTodos(locals.supabase, projectIds)
	]);
	const myTasks = tasks.filter((task) => projectIds.includes(task.projectId));
	return { myTasks, todos, untakenTodos };
};

export const actions = todoFormActions;
