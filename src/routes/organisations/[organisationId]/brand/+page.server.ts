import { findCampaigns } from '$lib/server/brandCampaigns/findCampaigns';
import { readBrandKitPage } from '$lib/server/brandKits/readBrandKitPage';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	await parent();
	return {
		kit: await readBrandKitPage(locals.supabase, params.organisationId),
		campaigns: await findCampaigns(locals.supabase, params.organisationId)
	};
};
