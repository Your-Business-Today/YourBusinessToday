import { requireUser } from '$lib/server/auth/requireUser';
import { getReachableProjectIds } from '$lib/server/projects/getReachableProjectIds';
import { getTodosOwnedBy, getUntakenTodos } from '$lib/server/todos/getTodos';
import { todoFormActions } from '$lib/server/todos/todoFormActions';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const projectIds = await getReachableProjectIds(locals.supabase, user.id);
	const [todos, untakenTodos] = await Promise.all([
		getTodosOwnedBy(locals.supabase, user.id),
		getUntakenTodos(locals.supabase, projectIds)
	]);
	return { todos, untakenTodos };
};

export const actions = todoFormActions;
