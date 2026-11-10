import type { CampaignStatus } from '$lib/brand/campaigns/campaign';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where one of the organisation's campaigns stands now, or null when it holds none of that id. */
export async function findCampaignStatus(
	supabase: SupabaseClient,
	organisationId: string,
	campaignId: string
): Promise<CampaignStatus | null> {
	const { data, error } = await supabase
		.from('brand_campaigns')
		.select('status')
		.eq('organisation_id', organisationId)
		.eq('id', campaignId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return data.status as CampaignStatus;
}
