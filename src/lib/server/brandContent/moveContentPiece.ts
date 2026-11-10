import type { ContentMove } from '$lib/brand/content/contentMoves';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Moves one of the organisation's pieces by a step, only while it stands at a stage the step is taken from,
 * and says whether it moved. The stage is checked in the same update, so two people cannot both move it.
 */
export async function moveContentPiece(
	supabase: SupabaseClient,
	organisationId: string,
	contentPieceId: string,
	move: ContentMove
): Promise<boolean> {
	const { rule } = move;
	const { data, error } = await supabase
		.from('brand_content_pieces')
		.update(columnsOf(move))
		.eq('organisation_id', organisationId)
		.eq('id', contentPieceId)
		.in('stage', rule.from)
		.select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}

function columnsOf({ rule, scheduledFor, publishedUrl }: ContentMove): Record<string, string> {
	const columns: Record<string, string> = { stage: rule.to, updated_at: new Date().toISOString() };
	if (scheduledFor !== undefined) columns.scheduled_for = scheduledFor;
	if (publishedUrl !== undefined) columns.published_url = publishedUrl;
	return columns;
}
