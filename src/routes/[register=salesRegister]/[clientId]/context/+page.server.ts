import { error } from '@sveltejs/kit';
import { getClient } from '$lib/server/clients/getClient';
import { readCompanyContextOfClient } from '$lib/server/companyContext/readCompanyContextOfClient';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { keepOnItsRegister } from '$lib/server/salesRegisters/keepOnItsRegister';
import type { PageServerLoad } from './$types';

const notFound = 404;

export const load: PageServerLoad = async ({ locals, params, url }) => {
	await requireStaff(locals);
	const client = await getClient(locals.supabase, params.clientId);
	if (client === null) error(notFound, 'That company could not be found');
	keepOnItsRegister(url, params.register, client.stage);
	const reading = await readCompanyContextOfClient(client.id);
	return { client, reading };
};
