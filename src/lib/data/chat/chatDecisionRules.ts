import type { PostedVia } from '$lib/data/conversationTurn';

/** The limits on a decision raised in a room, stated once and mirrored by the checks on migration 0277's columns. */
export const chatDecisionLimits = {
	longestWording: 2000,
	longestOutcome: 2000,
	latestDecisionsShown: 200
} as const;

/** Where a decision stands: waiting on someone, or closed out with its outcome. */
export const chatDecisionStatuses = { open: 'open', closed: 'closed' } as const;

export type ChatDecisionStatus = (typeof chatDecisionStatuses)[keyof typeof chatDecisionStatuses];

/** One decision raised in a room from one of its messages, as chat_decisions keeps it. */
export type ChatDecision = {
	id: string;
	roomId: string;
	messageId: string;
	wording: string;
	raisedByAccountId: string;
	raisedVia: PostedVia;
	waitingOnAccountId: string;
	status: ChatDecisionStatus;
	outcome: string | null;
	closedByAccountId: string | null;
	closedAt: string | null;
	createdAt: string;
};

/** A decision as the room and chat home list it: the people named, its room's name and the words of its message. */
export type ListedChatDecision = ChatDecision & {
	roomName: string;
	messageWords: string;
	raiserName: string;
	waitingOnName: string;
	closerName: string | null;
};

/** A person of the organisation a decision can wait on, as the form lists them. */
export type ChatPerson = { id: string; name: string };

/** A decision as it is asked to be raised, checked by validateDecisionRaising. */
export type ChatDecisionRaising = { messageId: string; wording: string; waitingOn: string };

/** A decision as it is asked to be closed, checked by validateDecisionClosing. */
export type ChatDecisionClosing = { decisionId: string; outcome: string };

const { longestWording, longestOutcome } = chatDecisionLimits;

export const chatDecisionRefusals = {
	wording: `A decision's wording is 1 to ${longestWording} characters.`,
	outcome: `A decision's outcome is 1 to ${longestOutcome} characters.`,
	waitingOn: 'Name the person of this organisation the decision waits on.',
	notAPerson: 'The decision waits on a person of this organisation; choose one from the list.',
	archivedRoom: 'This room is archived, so no decision can be raised in it.',
	messageNotInRoom: 'A decision is raised from a message in this room; read the room again and choose again.',
	noSuchDecision: 'No decision of this organisation has that id.',
	alreadyClosed: 'That decision is closed already, and a closed decision is not reopened.'
} as const;
