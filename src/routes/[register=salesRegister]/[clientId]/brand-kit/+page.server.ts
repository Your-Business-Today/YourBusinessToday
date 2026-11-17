import { readBrandKitPage } from '$lib/server/brandKits/readBrandKitPage';
import { readLeadOfPage } from '$lib/server/clients/readLeadOfPage';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PageServerLoad } from './$types';

/** A lead's organisation may not have Brand switched on, which row security asks, so its kit is read with the service key once staff are let in. */
export const load: PageServerLoad = async (event) => {
	const { client, organisationId } = await readLeadOfPage(event.locals, event);
	if (organisationId === null) return { client, kit: null };
	return { client, kit: await readBrandKitPage(supabaseServiceClient(), organisationId) };
};
