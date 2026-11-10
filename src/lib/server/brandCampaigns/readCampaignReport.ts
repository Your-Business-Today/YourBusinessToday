import { campaignReportOf, type CampaignReport } from '$lib/brand/campaigns/campaignReport';
import { findCampaign } from './findCampaign';
import { findCampaignAudience } from './findCampaignAudience';
import { findCampaignFigures } from './findCampaignFigures';
import { isUuid } from '$lib/data/isUuid';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The report of one of the organisation's campaigns, or null when its brand holds no campaign of that id. */
export async function readCampaignReport(supabase: SupabaseClient, organisationId: string, campaignId: string): Promise<CampaignReport | null> {
	if (!isUuid(campaignId)) return null;
	const campaign = await findCampaign(supabase, organisationId, campaignId);
	if (campaign === null) return null;
	const figures = await findCampaignFigures(supabase, organisationId, campaignId);
	const audience = await findCampaignAudience(supabase, organisationId, campaignId);
	return campaignReportOf({ campaign, figures, audience });
}
