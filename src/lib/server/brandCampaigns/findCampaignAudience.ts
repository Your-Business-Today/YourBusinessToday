import type { AgeBand, Gender } from '$lib/brand/audience/audienceBands';
import type { AudienceRow } from '$lib/brand/audience/audienceRow';
import type { CampaignAudience } from '$lib/brand/campaigns/campaignReport';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

type CampaignIds = { organisationId: string; campaignId: string };

const bandColumns = 'age_band, gender, reach, impressions, clicks, spend_pence';

const nobodyYet: CampaignAudience = { observedOn: null, rows: [] };

/** The latest breakdown of who the campaign reached, or none when the platform's breakdown was never recorded. */
export async function findCampaignAudience(supabase: SupabaseClient, organisationId: string, campaignId: string): Promise<CampaignAudience> {
	const ids = { organisationId, campaignId };
	const observedOn = await findLatestAudienceDay(supabase, ids);
	if (observedOn === null) return nobodyYet;
	const { data, error } = await selectAudiences(supabase, ids, bandColumns).eq('observed_on', observedOn);
	if (error) throw error;
	return { observedOn, rows: ((data ?? []) as unknown as Row[]).map(audienceRowOf) };
}

async function findLatestAudienceDay(supabase: SupabaseClient, ids: CampaignIds): Promise<string | null> {
	const { data, error } = await selectAudiences(supabase, ids, 'observed_on')
		.order('observed_on', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return (data as unknown as Row).observed_on as string;
}

function selectAudiences(supabase: SupabaseClient, { organisationId, campaignId }: CampaignIds, columns: string) {
	return supabase.from('brand_campaign_audiences').select(columns).eq('organisation_id', organisationId).eq('campaign_id', campaignId);
}

function audienceRowOf(row: Row): AudienceRow {
	return {
		ageBand: row.age_band as AgeBand,
		gender: row.gender as Gender,
		reach: Number(row.reach),
		impressions: Number(row.impressions),
		clicks: Number(row.clicks),
		spendPence: Number(row.spend_pence)
	};
}
