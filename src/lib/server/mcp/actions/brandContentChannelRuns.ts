import { brandSnapshotOf } from '$lib/brand/projections/brandSnapshot';
import { captionRulesOf } from '$lib/brand/captions/captionRules';
import { checkNewChannel, type NewChannel } from '$lib/brand/posts/checkNewChannel';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { findContentPost } from '$lib/server/brandContent/findContentPost';
import { hasChannel, type ContentPost } from '$lib/brand/posts/contentPost';
import { isUuid } from '$lib/data/isUuid';
import { keepPostChannel } from '$lib/server/brandContent/keepPostChannel';
import { noSuchPiece } from './brandContentAnswers';
import { problemWithCaption } from '$lib/brand/captions/checkCaptionFitsChannel';
import { problemWithInvitedAction } from '$lib/brand/content/checkInvitedAction';
import { readText } from '../actionTypes';
import { resolveBrandKitFor } from '$lib/server/brandKits/resolveBrandKitFor';
import type { ContentPiece } from '$lib/brand/content/contentPiece';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const notAdded = (problem: string) => `The channel was not added: ${problem}. Nothing was kept.`;

/** Adds a channel to the post a piece is a channel of, with its own caption written to the brand as it holds there. */
export async function addContentChannel(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation) {
	const check = checkNewChannel(input);
	if ('problem' in check) return notAdded(check.problem);
	const contentPieceId = readText(input, 'contentPieceId');
	const found = isUuid(contentPieceId) ? await findContentPiece(caller.supabase, organisation.id, contentPieceId) : null;
	if (found === null) return noSuchPiece;
	const { channel } = check;
	const { medium } = channel;
	const source = found.piece;
	const post = await findContentPost(caller.supabase, organisation.id, source);
	if (hasChannel(post, medium.path)) return notAdded(`the post already goes out on ${medium.label}`);
	const resolved = await resolveBrandKitFor(caller.supabase, organisation.id, medium);
	const invitedAction = channel.invitedAction ?? source.invitedAction;
	const problem = problemWithInvitedAction(invitedAction, medium) ?? problemWithCaption(channel.caption, captionRulesOf(resolved));
	if (problem !== null) return notAdded(problem);
	const brandSnapshot = brandSnapshotOf(organisation.name, resolved);
	const given = { organisationId: organisation.id, accountId: caller.accountId, post, source, ...channel, invitedAction, brandSnapshot };
	const newPieceId = await keepPostChannel(caller.supabase, given);
	return addedAnswer(source, channel, newPieceId, post);
}

function addedAnswer(source: ContentPiece, { medium }: NewChannel, newPieceId: string, { channels }: ContentPost): string {
	const channelCount = channels.length + 1;
	return (
		`Added ${medium.label} to the post “${source.title}”, which now goes out on ${channelCount} channels (id ${newPieceId}). ` +
		'It shares the post’s words, kind and planned day, with its own caption, and is approved, scheduled and published on its own.'
	);
}
