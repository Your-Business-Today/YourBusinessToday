import { fail } from '@sveltejs/kit';
import { addTodo, updateTodo } from '$lib/server/todos/saveTodo';
import { chooseTodoOwner } from '$lib/server/todos/chooseTodoOwner';
import { findTaskOnProject, taskOnProjectRequired } from '$lib/server/projects/findTaskOnProject';
import { getTodo } from '$lib/server/todos/getTodos';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { todoFormActions } from '$lib/server/todos/todoFormActions';
import { isUuid } from '$lib/data/isUuid';
import { validateTodoChanges } from '$lib/data/validateTodo';
import type { Actions } from './$types';

const todoOnProjectRequired = 'A to-do on this project is required.';

/** An item's to-dos, added and changed beneath it on the Internal work board. */
export const todoActions = {
	addTodo: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
		if (task === null) return fail(400, { message: taskOnProjectRequired });
		const changes = validateTodoChanges({ title: formData.get('title') });
		if (typeof changes === 'string') return fail(400, { message: changes });
		const place = { ownerAccountId: null, projectId: task.projectId, taskId: task.id };
		await addTodo(locals.supabase, place, { title: changes.title ?? '' }, user.id);
		return {};
	},
	updateTodo: todoFormActions.updateTodo,
	setTodoOwner: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const todoId = String(formData.get('todoId') ?? '');
		if (!isUuid(todoId)) return fail(400, { message: todoOnProjectRequired });
		const todo = await getTodo(locals.supabase, todoId);
		if (todo === null || todo.projectId !== params.projectId) return fail(400, { message: todoOnProjectRequired });
		const choice = await chooseTodoOwner(locals.supabase, todo, String(formData.get('owner') ?? ''));
		if (typeof choice === 'string') return fail(400, { message: choice });
		await updateTodo(locals.supabase, todo.id, choice);
		return {};
	}
} satisfies Actions;
