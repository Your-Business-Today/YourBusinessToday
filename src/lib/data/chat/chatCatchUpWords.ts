import { formatBritishDateTime } from '$lib/data/britishDate';
import { postedViaChannels } from '$lib/data/conversationTurn';
import type { NamedChatSummary } from './chatSummaryRules';

const oneMessage = 1;

export const catchUpTitle = 'While you were away';

/** The one line a reader with unread messages and no catch-up is given: the site writes none itself. */
export const askYourClaudeToCatchUp = 'Ask your Claude to catch you up on this room.';

/** Who wrote the catch-up: the person, or the person through their Claude. */
export function writerOfSummary(summary: NamedChatSummary): string {
	const isByTheirClaude = summary.writtenVia === postedViaChannels.claude;
	if (isByTheirClaude) return `${summary.writerName}'s Claude`;
	return summary.writerName;
}

/** What the catch-up covers up to and who wrote it, in the room's own date format. */
export function coverageSentence(summary: NamedChatSummary): string {
	return `Covers up to ${formatBritishDateTime(summary.coversUpTo)}, written by ${writerOfSummary(summary)}.`;
}

/** The plain line saying the catch-up misses messages said after it, or null when it misses none. */
export function missedSentence(messagesAfterSummary: number): string | null {
	if (messagesAfterSummary < oneMessage) return null;
	if (messagesAfterSummary === oneMessage) return '1 new message came after this catch-up: read it below.';
	return `${messagesAfterSummary} new messages came after this catch-up: read them below.`;
}
