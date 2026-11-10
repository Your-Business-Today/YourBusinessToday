import { ContentStages, type BrandSnapshot } from '$lib/brand/content/contentPiece';
import type { ContentDraft } from '$lib/brand/content/contentDraft';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ContentPieceToKeep = { organisationId: string; accountId: string; draft: ContentDraft; brandSnapshot: BrandSnapshot };

/** Keeps a drafted piece in the organisation's brand content and gives its id. */
export async function keepContentPiece(supabase: SupabaseClient, piece: ContentPieceToKeep): Promise<string> {
	const { data, error } = await supabase.from('brand_content_pieces').insert(rowOf(piece)).select('id').single();
	if (error) throw error;
	return data.id as string;
}

function rowOf(piece: ContentPieceToKeep): Record<string, unknown> {
	const { medium, title, hook, script, storyboard, caption, invitedAction } = piece.draft;
	return {
		organisation_id: piece.organisationId,
		medium_path: medium.path,
		title,
		hook,
		script,
		storyboard,
		caption,
		invited_action: invitedAction,
		stage: ContentStages.drafted,
		brand_snapshot: piece.brandSnapshot,
		created_by: piece.accountId
	};
}
