import { deleteClientWithId, isDeletionRefused } from '$lib/server/clients/deleteClientWithId';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { RequestEvent } from '@sveltejs/kit';

/** Deletes a duplicate or mistaken record from either register, from its row's actions. */
export async function deleteFromRegisterAction({ locals, request }: RequestEvent) {
	const user = await requireStaff(locals);
	const formData = await request.formData();
	const clientId = String(formData.get('clientId') ?? '');
	const deleted = await deleteClientWithId(locals.supabase, clientId, user.id);
	if (isDeletionRefused(deleted)) return deleted;
	return { message: `${deleted.name} is deleted from the register, and the deletion is recorded under your name.` };
}
