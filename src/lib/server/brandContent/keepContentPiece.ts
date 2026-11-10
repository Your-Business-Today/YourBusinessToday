import { ContentStages, type BrandSnapshot } from '$lib/brand/content/contentPiece';
import type { ContentDraft } from '$lib/brand/content/contentDraft';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ContentPieceToKeep = { organisationId: string; accountId: string; draft: ContentDraft; brandSnapshot: BrandSnapshot };

/** Keeps a drafted piece in the organisation's brand content and gives its id. */
export async function keepContentPiece(supabase: SupabaseClient, piece: ContentPieceToKeep): Promise<string> {
	const row = { ...draftColumnsOf(piece), organisation_id: piece.organisationId, created_by: piece.accountId };
	const { data, error } = await supabase.from('brand_content_pieces').insert(row).select('id').single();
	if (error) throw error;
	return data.id as string;
}

/** The columns a draft writes, with the piece at drafted: a new piece's, or an idea's as it is written up. */
export function draftColumnsOf(piece: ContentPieceToKeep): Record<string, unknown> {
	const { medium, title, hook, script, storyboard, caption, invitedAction } = piece.draft;
	return {
		medium_path: medium.path,
		title,
		hook,
		script,
		storyboard,
		caption,
		invited_action: invitedAction,
		stage: ContentStages.drafted,
		brand_snapshot: piece.brandSnapshot
	};
}
