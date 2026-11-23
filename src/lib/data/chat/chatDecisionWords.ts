import { formatBritishDateTime } from '$lib/data/britishDate';
import { postedViaChannels } from '$lib/data/conversationTurn';
import type { ListedChatDecision } from './chatDecisionRules';

export const decisionsTitle = 'Decisions';

/** Where a decision's line in the room is, so the message it came from can point at it. */
export function decisionAnchor(decisionId: string): string {
	return `decision-${decisionId}`;
}

/** Who raised the decision: the person, or the person through their Claude. */
function raiserOf(decision: ListedChatDecision): string {
	const isByTheirClaude = decision.raisedVia === postedViaChannels.claude;
	if (isByTheirClaude) return `${decision.raiserName}'s Claude`;
	return decision.raiserName;
}

/** Who raised it, who it waits on and when, in the room's own date format. */
export function raisedSentence(decision: ListedChatDecision): string {
	return `Raised by ${raiserOf(decision)} on ${formatBritishDateTime(decision.createdAt)}, waiting on ${decision.waitingOnName}.`;
}

/** Who closed it and when, or null while it is open. */
export function closedSentence(decision: ListedChatDecision): string | null {
	if (decision.closedAt === null) return null;
	return `Closed by ${decision.closerName} on ${formatBritishDateTime(decision.closedAt)}.`;
}
