import type { CampaignFigures } from '$lib/brand/campaigns/campaignReport';
import type { SupabaseClient } from '@supabase/supabase-js';

type Row = Record<string, unknown>;

const PageOfReadings = { rows: 1000 } as const;

/** Every reading recorded for the campaign added up, page by page so none is left out. */
export async function findCampaignFigures(supabase: SupabaseClient, organisationId: string, campaignId: string): Promise<CampaignFigures> {
	const figures: CampaignFigures = { spendPence: 0, impressions: 0, reach: 0, clicks: 0 };
	for (let firstRow = 0; ; firstRow += PageOfReadings.rows) {
		const page = await findPage(supabase, { organisationId, campaignId }, firstRow);
		page.forEach((row) => addRow(figures, row));
		const isLastPage = page.length < PageOfReadings.rows;
		if (isLastPage) return figures;
	}
}

async function findPage(supabase: SupabaseClient, ids: { organisationId: string; campaignId: string }, firstRow: number) {
	const { data, error } = await supabase
		.from('brand_performance_readings')
		.select('spend_pence, impressions, reach, clicks')
		.eq('organisation_id', ids.organisationId)
		.eq('campaign_id', ids.campaignId)
		.order('id', { ascending: true })
		.range(firstRow, firstRow + PageOfReadings.rows - 1);
	if (error) throw error;
	return (data ?? []) as Row[];
}

function addRow(figures: CampaignFigures, row: Row) {
	figures.spendPence += Number(row.spend_pence);
	figures.impressions += Number(row.impressions);
	figures.reach += Number(row.reach);
	figures.clicks += Number(row.clicks);
}
