import type { PostedVia } from '$lib/data/conversationTurn';
import type { ChatMessageFile } from './chatFileRules';

/** The limits on a chat message, stated once and mirrored by the checks on migration 0272's columns, widened by 0275. */
export const chatMessageLimits = {
	longestBody: 4000,
	latestMessagesShown: 200
} as const;

/** How often an open room reads itself again while its tab is on screen. */
export const chatRoomRefreshMilliseconds = 5_000;

/** The load dependency an open room re-reads on each refresh. */
export const chatRoomDependency = 'ybt:chat-room';

/** One thing said in a room, as the room shows it: its words, which may be none, and the files it carries. */
export type ChatMessage = {
	id: string;
	roomId: string;
	authorAccountId: string;
	body: string;
	postedVia: PostedVia;
	createdAt: string;
	movedByMoveId: string | null;
	files: ChatMessageFile[];
};

export const chatMessageRefusals = {
	body: `A message's words are at most ${chatMessageLimits.longestBody} characters.`,
	archivedRoom: 'This room is archived, so nothing more can be said in it.',
	noSuchRoom: 'No room of this organisation has that id.'
} as const;
