import { ContentStages, type BrandSnapshot, type ContentPiece } from '$lib/brand/content/contentPiece';
import { keepPostOfPiece } from './keepPostOfPiece';
import type { ContentPost } from '$lib/brand/posts/contentPost';
import type { Medium } from '$lib/brand/mediums/mediumDefinition';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A new channel's version of a post: written from one of its channels, with its own medium, caption, action and brand. */
export type PostChannelToKeep = {
	organisationId: string;
	accountId: string;
	post: ContentPost;
	source: ContentPiece;
	medium: Medium;
	caption: string;
	invitedAction: string;
	brandSnapshot: BrandSnapshot;
};

/**
 * Keeps a new channel on a post and gives its piece's id. The piece shares the source's words, kind and planned day,
 * and starts at idea while the source is an idea, otherwise at drafted, to be approved, scheduled and published on its own.
 */
export async function keepPostChannel(supabase: SupabaseClient, channel: PostChannelToKeep): Promise<string> {
	const { organisationId, accountId, post } = channel;
	if (!post.isKept) await keepPostOfPiece(supabase, { organisationId, accountId, contentPieceId: post.id });
	const { data, error } = await supabase.from('brand_content_pieces').insert(pieceRowOf(channel)).select('id').single();
	if (error) throw error;
	const contentPieceId = data.id as string;
	const channelRow = { content_piece_id: contentPieceId, post_id: post.id, organisation_id: organisationId };
	const { error: channelError } = await supabase.from('brand_content_post_channels').insert(channelRow);
	if (channelError) throw channelError;
	return contentPieceId;
}

function pieceRowOf({ organisationId, accountId, source, medium, caption, invitedAction, brandSnapshot }: PostChannelToKeep) {
	const isIdea = source.stage === ContentStages.idea;
	const { title, hook, script, storyboard, kind, plannedFor } = source;
	return {
		...{ title, hook, script, storyboard, kind, caption, organisation_id: organisationId },
		medium_path: medium.path,
		invited_action: invitedAction,
		stage: isIdea ? ContentStages.idea : ContentStages.drafted,
		brand_snapshot: brandSnapshot,
		planned_for: plannedFor,
		created_by: accountId
	};
}
