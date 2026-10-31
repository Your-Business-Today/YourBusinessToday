import { fail } from '@sveltejs/kit';
import { requireUser } from '$lib/server/auth/requireUser';
import { validateRecordId } from '$lib/data/isUuid';
import { validateTodoChanges } from '$lib/data/validateTodo';
import { updateTodo } from './saveTodo';
import type { RequestEvent } from '@sveltejs/kit';

/** The site's to-do form: change a to-do, or take one. Row-level security guards whose. */
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
	}
};
