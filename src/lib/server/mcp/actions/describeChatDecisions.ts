import { chatDecisionLimits, chatDecisionStatuses, type ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
import { describeListedDecision, isWaitingOnReader, waitingClause } from './describeChatDecision';
import type { ChatDecisionListing } from '$lib/server/chat/listChatDecisionsAsked';

const noneLeftOut = 0;
const noDecisions = 0;
const openFirst = 'open first, newest raised first, then closed, latest closed first';

function whereOf(organisationName: string, listing: ChatDecisionListing): string {
	const chat = `${organisationName}'s chat`;
	const { room } = listing;
	if (room === null) return chat;
	return `${room.name}, room ${room.id}, in ${chat}`;
}

function kindOf(listing: ChatDecisionListing): string {
	if (listing.status === null) return 'decisions';
	return `${listing.status} decisions`;
}

function waitingOnReaderLine(decisions: ListedChatDecision[], readerAccountId: string): string {
	const waitingCount = decisions.filter((decision) => isWaitingOnReader(decision, readerAccountId)).length;
	if (waitingCount === noDecisions) return 'None of them waits on you.';
	return `Waiting on you: ${waitingCount} of them, each marked "waiting on you".`;
}

function leftOutLine(listing: ChatDecisionListing): string | null {
	if (listing.decisionsLeftOut === noneLeftOut) return null;
	return `${listing.decisionsLeftOut} more are left out; list again with a larger limit, up to ${chatDecisionLimits.latestDecisionsShown}.`;
}

function mostReadLine(listing: ChatDecisionListing): string | null {
	if (!listing.isAtMostRead) return null;
	return `Only the latest ${chatDecisionLimits.latestDecisionsShown} decisions raised are read, as the site shows them.`;
}

/** The decisions a listing gives, open first, saying which wait on the reader, then what it left out. */
export function describeChatDecisions(organisationName: string, listing: ChatDecisionListing, readerAccountId: string): string {
	const { decisions } = listing;
	const where = whereOf(organisationName, listing);
	if (decisions.length === noDecisions) return `There are no ${kindOf(listing)} in ${where}.`;
	const opening = `The ${kindOf(listing)} of ${where}, ${openFirst}. ${waitingOnReaderLine(decisions, readerAccountId)}`;
	const lines = [opening, ...decisions.map((decision) => describeListedDecision(decision, readerAccountId)), leftOutLine(listing), mostReadLine(listing)];
	return lines.filter((line) => line !== null).join('\n');
}

/** A room's open decisions as its reading names them: how many, each one's wording and on whom it waits. */
export function describeOpenDecisionsOfRoom(decisions: ListedChatDecision[], readerAccountId: string): string {
	const openDecisions = decisions.filter((decision) => decision.status === chatDecisionStatuses.open);
	if (openDecisions.length === noDecisions) return 'No decision is open in this room.';
	const opening = `Open decisions in this room: ${openDecisions.length}, raised from its messages; list_chat_decisions gives each in full:`;
	const lines = openDecisions.map((decision) => `- ${decision.wording} (decision ${decision.id}, ${waitingClause(decision, readerAccountId)})`);
	return [opening, ...lines].join('\n');
}
