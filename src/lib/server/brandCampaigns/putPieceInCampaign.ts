import type { PieceForCampaign } from '$lib/brand/campaigns/campaign';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Puts one of the brand's pieces behind one of its campaigns; a piece already there stays as it was. */
export async function putPieceInCampaign(supabase: SupabaseClient, piece: PieceForCampaign): Promise<void> {
	const row = {
		organisation_id: piece.organisationId,
		campaign_id: piece.campaignId,
		content_piece_id: piece.contentPieceId,
		added_by: piece.accountId
	};
	const onePiecePerCampaign = { onConflict: 'campaign_id,content_piece_id', ignoreDuplicates: true };
	const { error } = await supabase.from('brand_campaign_pieces').upsert(row, onePiecePerCampaign);
	if (error) throw error;
}
