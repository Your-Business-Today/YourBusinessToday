import { findCampaigns } from '$lib/server/brandCampaigns/findCampaigns';
import { findProductBrands } from '$lib/server/brandKits/findProductBrands';
import { organisationHolder } from '$lib/server/brandKits/brandHolder';
import { readBrandKitPage } from '$lib/server/brandKits/readBrandKitPage';
import { readPiecesAwaitingApproval } from '$lib/server/brandContent/readPiecesAwaitingApproval';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	const { brandOrganisation } = await parent();
	const [kit, awaitingApproval, campaigns, products] = await Promise.all([
		readBrandKitPage(locals.supabase, organisationHolder(brandOrganisation)),
		readPiecesAwaitingApproval(locals.supabase, params.organisationId),
		findCampaigns(locals.supabase, params.organisationId),
		findProductBrands(locals.supabase, params.organisationId)
	]);
	return { kit, awaitingApproval, campaigns, products };
};
