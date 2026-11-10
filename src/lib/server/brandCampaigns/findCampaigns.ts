import { campaignColumns, campaignHeadOf } from './campaignRow';
import type { Campaign, CampaignPiece } from '$lib/brand/campaigns/campaign';
import type { SupabaseClient } from '@supabase/supabase-js';

export const CampaignListing = { mostCampaigns: 100 } as const;

type Row = Record<string, unknown>;

/** The organisation's campaigns, latest start first, each with the pieces it holds. */
export async function findCampaigns(supabase: SupabaseClient, organisationId: string): Promise<Campaign[]> {
	const { data, error } = await supabase
		.from('brand_campaigns')
		.select(campaignColumns)
		.eq('organisation_id', organisationId)
		.order('starts_on', { ascending: false })
		.limit(CampaignListing.mostCampaigns);
	if (error) throw error;
	const rows = (data ?? []) as Row[];
	const piecesByCampaign = await findPiecesByCampaign(supabase, organisationId, rows.map((row) => row.id as string));
	return rows.map((row) => campaignOf(row, piecesByCampaign.get(row.id as string) ?? []));
}

async function findPiecesByCampaign(supabase: SupabaseClient, organisationId: string, campaignIds: string[]) {
	const piecesByCampaign = new Map<string, CampaignPiece[]>();
	if (campaignIds.length === 0) return piecesByCampaign;
	const { data, error } = await supabase
		.from('brand_campaign_pieces')
		.select('campaign_id, content_piece_id, brand_content_pieces (title, stage)')
		.eq('organisation_id', organisationId)
		.in('campaign_id', campaignIds)
		.order('created_at', { ascending: true });
	if (error) throw error;
	for (const row of (data ?? []) as Row[]) {
		const campaignId = row.campaign_id as string;
		piecesByCampaign.set(campaignId, [...(piecesByCampaign.get(campaignId) ?? []), pieceOf(row)]);
	}
	return piecesByCampaign;
}

function pieceOf(row: Row): CampaignPiece {
	const content = (row.brand_content_pieces ?? {}) as Row;
	return { contentPieceId: row.content_piece_id as string, title: String(content.title ?? ''), stage: String(content.stage ?? '') };
}

function campaignOf(row: Row, pieces: CampaignPiece[]): Campaign {
	return { ...campaignHeadOf(row), pieces };
}
