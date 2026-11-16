import { deleteClientWithId, isDeletionRefused } from '$lib/server/clients/deleteClientWithId';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { getClient } from '$lib/server/clients/getClient';
import { requireSalesSwitchedOn } from '$lib/server/salesPeople/requireSalesSwitchedOn';
import { validateRecordId } from '$lib/data/isUuid';
import { fail, type RequestEvent } from '@sveltejs/kit';

/** Deletes a duplicate or mistaken record from either register, from its row's actions. */
export async function deleteFromRegisterAction({ locals, request }: RequestEvent) {
	const user = await requireStaff(locals);
	const formData = await request.formData();
	const clientId = String(formData.get('clientId') ?? '');
	const idRefusal = validateRecordId('client', clientId);
	if (idRefusal !== null) return fail(400, { message: idRefusal });
	const client = await getClient(locals.supabase, clientId);
	if (client === null) return fail(404, { message: 'That record could not be found.' });
	await requireSalesSwitchedOn(locals, client.keptByOrganisationId);
	const deleted = await deleteClientWithId(locals.supabase, clientId, user.id);
	if (isDeletionRefused(deleted)) return deleted;
	return { message: `${deleted.name} is deleted from the register, and the deletion is recorded under your name.` };
}
