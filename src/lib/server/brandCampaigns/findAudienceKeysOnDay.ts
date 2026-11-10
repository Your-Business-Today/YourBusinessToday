import { audienceRowKey } from '$lib/brand/audience/audienceRow';
import type { AgeBand, Gender } from '$lib/brand/audience/audienceBands';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = { age_band: AgeBand; gender: Gender };

/** The age band and gender of every row the campaign already holds for the day. */
export async function findAudienceKeysOnDay(
	supabase: SupabaseClient,
	campaign: { organisationId: string; campaignId: string },
	observedOn: string
): Promise<Set<string>> {
	const { data, error } = await supabase
		.from('brand_campaign_audiences')
		.select('age_band, gender')
		.eq('organisation_id', campaign.organisationId)
		.eq('campaign_id', campaign.campaignId)
		.eq('observed_on', observedOn);
	if (error) throw error;
	return new Set(((data ?? []) as Row[]).map((row) => audienceRowKey({ ageBand: row.age_band, gender: row.gender })));
}
