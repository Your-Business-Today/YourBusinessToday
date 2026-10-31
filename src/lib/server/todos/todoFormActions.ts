import { fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth/requireUser';
import { validateRecordId } from '$lib/data/isUuid';
import { validateTodoChanges } from '$lib/data/validateTodo';
import { addTodo, updateTodo } from './saveTodo';
import type { RequestEvent } from '@sveltejs/kit';

const titleRequired = 'A to-do needs a title.';

/** The site's to-do forms: add one to your own list, and change or take one. Row-level security guards whose. */
export const todoFormActions = {
	addTodo: async ({ locals, request }: RequestEvent) => {
		const user = await requireUser(locals);
		const formData = Object.fromEntries(await request.formData());
		const changes = validateTodoChanges(formData);
		if (typeof changes === 'string') return fail(400, { message: changes });
		if (changes.title === undefined) return fail(400, { message: titleRequired });
		const place = { ownerAccountId: user.id, projectId: null, taskId: null };
		await addTodo(locals.supabase, place, { ...changes, title: changes.title }, user.id);
		return {};
	},
	updateTodo: async ({ locals, request }: RequestEvent) => {
		const user = await requireUser(locals);
		const { todoId, takeIt, ...fields } = Object.fromEntries(await request.formData());
		const idRefusal = validateRecordId('to-do', String(todoId ?? ''));
		if (idRefusal !== null) return fail(400, { message: idRefusal });
		const changes = validateTodoChanges(fields);
		if (typeof changes === 'string') return fail(400, { message: changes });
		const owner = takeIt === undefined ? {} : { ownerAccountId: user.id };
		await updateTodo(locals.supabase, String(todoId), { ...changes, ...owner });
		return {};
	}
};
