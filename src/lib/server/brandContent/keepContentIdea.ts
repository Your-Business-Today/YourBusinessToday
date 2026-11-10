import { keepPostOfPiece } from './keepPostOfPiece';
import { ContentStages } from '$lib/brand/content/contentPiece';
import type { ContentIdea } from '$lib/brand/content/contentIdea';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ContentIdeaToKeep = { organisationId: string; accountId: string; idea: ContentIdea; kind: string };

/** Keeps an idea on the day it is planned for, before any script exists, as a post of its own on one channel, and gives its id. */
export async function keepContentIdea(supabase: SupabaseClient, { organisationId, accountId, idea, kind }: ContentIdeaToKeep): Promise<string> {
	const { medium, title, hook, plannedFor } = idea;
	const row = {
		organisation_id: organisationId,
		medium_path: medium.path,
		title,
		hook,
		kind,
		stage: ContentStages.idea,
		planned_for: plannedFor,
		created_by: accountId
	};
	const { data, error } = await supabase.from('brand_content_pieces').insert(row).select('id').single();
	if (error) throw error;
	const contentPieceId = data.id as string;
	await keepPostOfPiece(supabase, { organisationId, accountId, contentPieceId });
	return contentPieceId;
}
