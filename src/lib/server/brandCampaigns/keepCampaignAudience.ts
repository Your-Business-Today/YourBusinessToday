import type { AudienceRow, AudienceToKeep } from '$lib/brand/audience/audienceRow';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Keeps one day's breakdown of the campaign's audience, every band in one insert. */
export async function keepCampaignAudience(supabase: SupabaseClient, toKeep: AudienceToKeep): Promise<void> {
	const rows = toKeep.rows.map((row) => rowOf(row, toKeep));
	const { error } = await supabase.from('brand_campaign_audiences').insert(rows);
	if (error) throw error;
}

function rowOf(row: AudienceRow, toKeep: AudienceToKeep): Record<string, unknown> {
	return {
		organisation_id: toKeep.organisationId,
		campaign_id: toKeep.campaignId,
		observed_on: toKeep.observedOn,
		age_band: row.ageBand,
		gender: row.gender,
		reach: row.reach,
		impressions: row.impressions,
		clicks: row.clicks,
		spend_pence: row.spendPence,
		recorded_by: toKeep.accountId
	};
}
