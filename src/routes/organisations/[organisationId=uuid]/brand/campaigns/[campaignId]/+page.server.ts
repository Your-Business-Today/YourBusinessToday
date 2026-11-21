import { error } from '@sveltejs/kit';
import { readCampaignReport } from '$lib/server/brandCampaigns/readCampaignReport';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
	await parent();
	const report = await readCampaignReport(locals.supabase, params.organisationId, params.campaignId);
	if (report === null) error(404, 'No campaign of that id is in this brand');
	return { report };
};
