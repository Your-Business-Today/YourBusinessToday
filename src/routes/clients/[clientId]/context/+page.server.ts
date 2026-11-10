import { error } from '@sveltejs/kit';
import { getClient } from '$lib/server/clients/getClient';
import { readCompanyContextOfClient } from '$lib/server/companyContext/readCompanyContextOfClient';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { PageServerLoad } from './$types';

const notFound = 404;

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireStaff(locals);
	const client = await getClient(locals.supabase, params.clientId);
	if (client === null) error(notFound, 'That client could not be found');
	const context = await readCompanyContextOfClient(client.id);
	return { client, context };
};
