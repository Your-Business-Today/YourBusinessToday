import type { CampaignStatus } from '$lib/brand/campaigns/campaign';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Sets the status of one of the organisation's campaigns, and says whether it holds a campaign of that id. */
export async function setCampaignStatus(
	supabase: SupabaseClient,
	organisationId: string,
	campaignId: string,
	status: CampaignStatus
): Promise<boolean> {
	const { data, error } = await supabase
		.from('brand_campaigns')
		.update({ status, updated_at: new Date().toISOString() })
		.eq('organisation_id', organisationId)
		.eq('id', campaignId)
		.select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}
