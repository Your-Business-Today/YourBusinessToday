import { fail } from '@sveltejs/kit';
import { broughtInByRefusal, staffMemberWithId } from '$lib/data/broughtInByName';
import { getClient } from '$lib/server/clients/getClient';
import { getStaffDirectory } from '$lib/server/projects/getStaffDirectory';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { setClientOwner } from '$lib/server/clients/setClientOwner';
import { validateRecordId } from '$lib/data/isUuid';
import type { Actions } from './$types';

export const broughtInByActions: Actions = {
	setBroughtInBy: async ({ locals, params, request }) => {
		const user = await requireStaff(locals);
		const idRefusal = validateRecordId('client', params.clientId);
		if (idRefusal !== null) return fail(400, { message: idRefusal });
		const chosenId = String((await request.formData()).get('ownerId') ?? '');
		const owner = staffMemberWithId(await getStaffDirectory(locals.supabase), chosenId);
		if (owner === null) return fail(400, { message: broughtInByRefusal });
		const client = await getClient(locals.supabase, params.clientId);
		if (client === null) return fail(404, { message: 'That client could not be found.' });
		await setClientOwner(locals.supabase, client.id, owner, user.id);
		return { message: `${client.name} was brought in by ${owner.name}.` };
	}
};
