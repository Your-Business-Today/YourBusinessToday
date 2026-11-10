import { campaignColumns, campaignHeadOf } from './campaignRow';
import type { CampaignHead } from '$lib/brand/campaigns/campaign';
import type { SupabaseClient } from '@supabase/supabase-js';

/** One of the organisation's campaigns, or null when its brand holds none of that id. */
export async function findCampaign(supabase: SupabaseClient, organisationId: string, campaignId: string): Promise<CampaignHead | null> {
	const { data, error } = await supabase
		.from('brand_campaigns')
		.select(campaignColumns)
		.eq('organisation_id', organisationId)
		.eq('id', campaignId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return campaignHeadOf(data as Record<string, unknown>);
}
