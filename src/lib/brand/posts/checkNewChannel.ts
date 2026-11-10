import { ContentLimits } from '../content/contentLimits';
import { findMedium } from '../mediums/mediumCatalogue';
import type { Medium } from '../mediums/mediumDefinition';

/** A channel to add to a post: the medium it goes out on, its own caption, and the action it invites there if not the post's. */
export type NewChannel = { medium: Medium; caption: string; invitedAction: string | null };

export type NewChannelCheck = { channel: NewChannel } | { problem: string };

const { captionCharacters } = ContentLimits;

/** The channel as given, every value checked against its column, or the first reason it cannot be added. */
export function checkNewChannel(input: Record<string, unknown>): NewChannelCheck {
	const mediumPath = typeof input.medium === 'string' ? input.medium.trim() : '';
	const medium = findMedium(mediumPath);
	if (medium === null) return { problem: `${mediumPath || 'That'} is not a medium. Call read_brand_catalogue for the mediums` };
	const caption = input.caption ?? '';
	if (typeof caption !== 'string') return { problem: `caption is words, not ${typeof caption}` };
	const trimmedCaption = caption.trim();
	if (trimmedCaption.length > captionCharacters)
		return { problem: `caption is ${trimmedCaption.length} characters; keep it to ${captionCharacters}` };
	const invitedAction = input.invitedAction ?? null;
	const isInvitedActionWords = invitedAction === null || typeof invitedAction === 'string';
	if (!isInvitedActionWords) return { problem: `invitedAction is words, not ${typeof invitedAction}` };
	return { channel: { medium, caption: trimmedCaption, invitedAction: invitedAction?.trim() ?? null } };
}
