import { getClient } from '$lib/server/clients/getClient';
import { isUuid } from '$lib/data/isUuid';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireStaff(locals);
	const clientId = url.searchParams.get('clientId') ?? '';
	const existingClient = isUuid(clientId) ? await getClient(locals.supabase, clientId) : null;
	return {
		query: existingClient?.name ?? url.searchParams.get('query') ?? '',
		existingClient
	};
};
