import { findContentPieceStage } from './findContentPieceStage';
import { isUuid } from '$lib/data/isUuid';
import { ReplanOutcomes, ReplanStages, type PieceToReplan, type ReplanOutcome } from '$lib/brand/plan/contentReplan';
import type { ContentStage } from '$lib/brand/content/contentPiece';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Moves one of the organisation's pieces to another day, as the plan page and the connector both ask. A scheduled
 * piece moves its scheduled day too; a published one has gone out and is not moved. The stage is checked in the
 * same update that moves it.
 */
export async function replanContentPiece(supabase: SupabaseClient, piece: PieceToReplan): Promise<ReplanOutcome> {
	const { organisationId, contentPieceId, plannedFor } = piece;
	if (!isUuid(contentPieceId)) return ReplanOutcomes.noSuchPiece;
	const planned = { planned_for: plannedFor };
	if (await movePiece(supabase, piece, planned, ReplanStages.plannedOnly)) return ReplanOutcomes.moved;
	const scheduledToo = { ...planned, scheduled_for: plannedFor };
	if (await movePiece(supabase, piece, scheduledToo, ReplanStages.scheduledToo)) return ReplanOutcomes.moved;
	const stage = await findContentPieceStage(supabase, organisationId, contentPieceId);
	return stage === null ? ReplanOutcomes.noSuchPiece : ReplanOutcomes.hasGoneOut;
}

async function movePiece(
	supabase: SupabaseClient,
	{ organisationId, contentPieceId }: PieceToReplan,
	columns: Record<string, string>,
	stages: ContentStage[]
): Promise<boolean> {
	const { data, error } = await supabase
		.from('brand_content_pieces')
		.update({ ...columns, updated_at: new Date().toISOString() })
		.eq('organisation_id', organisationId)
		.eq('id', contentPieceId)
		.in('stage', stages)
		.select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}
