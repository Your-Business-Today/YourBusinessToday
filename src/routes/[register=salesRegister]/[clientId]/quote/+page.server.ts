import { error } from '@sveltejs/kit';
import { getClient } from '$lib/server/clients/getClient';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { keepOnItsRegister } from '$lib/server/salesRegisters/keepOnItsRegister';
import { listLeadQuoteVersions, readLeadQuote } from '$lib/server/leadQuotes/readLeadQuote';
import type { PageServerLoad } from './$types';

const notFound = 404;
const versionQueryKey = 'version';

export const load: PageServerLoad = async ({ locals, params, url }) => {
	await requireStaff(locals);
	const client = await getClient(locals.supabase, params.clientId);
	if (client === null) error(notFound, 'That company could not be found');
	keepOnItsRegister(url, params.register, client.stage);
	const askedVersion = Number(url.searchParams.get(versionQueryKey));
	const version = Number.isInteger(askedVersion) && askedVersion >= 1 ? askedVersion : null;
	const [quote, versions] = await Promise.all([
		readLeadQuote(locals.supabase, client.id, version),
		listLeadQuoteVersions(locals.supabase, client.id)
	]);
	if (version !== null && quote === null) error(notFound, 'That version of the quote could not be found');
	return { client, quote, versions };
};
