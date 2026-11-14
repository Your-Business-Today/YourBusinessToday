import { fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth/requireUser';
import { validateRecordId } from '$lib/data/isUuid';
import { validateTodoChanges } from '$lib/data/validateTodo';
import { deleteTodo, updateTodo } from './saveTodo';
import { todoDeletionRefused } from './todoDeletion';
import type { RequestEvent } from '@sveltejs/kit';

/** The site's to-do form: change a to-do, take one, or delete one. Row-level security guards whose. */
export const todoFormActions = {
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
	},
	deleteTodo: async ({ locals, request }: RequestEvent) => {
		await requireUser(locals);
		const todoId = String((await request.formData()).get('todoId') ?? '');
		const idRefusal = validateRecordId('to-do', todoId);
		if (idRefusal !== null) return fail(400, { message: idRefusal });
		const isDeleted = await deleteTodo(locals.supabase, todoId);
		if (!isDeleted) return fail(403, { message: todoDeletionRefused });
		return {};
	}
};
