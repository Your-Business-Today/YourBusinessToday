import { formatUkDayAndTime } from '$lib/data/britishDate';
import { raiserOf } from '$lib/data/chat/chatDecisionWords';
import { chatDecisionStatuses, type ChatDecision, type ListedChatDecision } from '$lib/data/chat/chatDecisionRules';
import { indentedLines } from './indentedLines';

const wordsIndent = '  ';
const quotedIndent = '    ';

/** Whether the decision is open and waits on the person the reading is for. */
export function isWaitingOnReader(decision: ChatDecision, readerAccountId: string): boolean {
	const isOpen = decision.status === chatDecisionStatuses.open;
	return isOpen && decision.waitingOnAccountId === readerAccountId;
}

/** On whom the decision waits, or waited once it is closed: "waiting on you" when it is open and on the reader. */
export function waitingClause(decision: ListedChatDecision, readerAccountId: string): string {
	if (isWaitingOnReader(decision, readerAccountId)) return 'waiting on you';
	if (decision.status === chatDecisionStatuses.open) return `waiting on ${decision.waitingOnName}`;
	return `it waited on ${decision.waitingOnName}`;
}

function messageLines(decision: ListedChatDecision): string[] {
	const opening = `${wordsIndent}From message ${decision.messageId}`;
	if (decision.messageWords === '') return [`${opening}, which carries files and no words.`];
	return [`${opening}, which said:`, indentedLines(decision.messageWords, quotedIndent)];
}

function closingLines(decision: ListedChatDecision): string[] {
	if (decision.closedAt === null) return [];
	const heading = `${wordsIndent}Closed by ${decision.closerName} on ${formatUkDayAndTime(decision.closedAt)}, with the outcome:`;
	return [heading, indentedLines(decision.outcome ?? '', quotedIndent)];
}

/**
 * One decision: its id, where it stands and on whom it waits, the room it was raised in, its wording, the message it
 * came from, who raised it and when, and, once closed, who closed it, when and with what outcome.
 */
export function describeListedDecision(decision: ListedChatDecision, readerAccountId: string): string {
	const heading = `- Decision ${decision.id}, ${decision.status}, ${waitingClause(decision, readerAccountId)} — in ${decision.roomName}, room ${decision.roomId}:`;
	const raised = `${wordsIndent}Raised by ${raiserOf(decision)} on ${formatUkDayAndTime(decision.createdAt)}.`;
	const lines = [heading, indentedLines(decision.wording, wordsIndent), ...messageLines(decision), raised, ...closingLines(decision)];
	return lines.join('\n');
}

/** The decision as it is raised: where, from which message, and that it now waits on the person named. */
export function describeRaisedDecision(organisationName: string, decision: ChatDecision): string {
	return (
		`Decision ${decision.id} is raised in room ${decision.roomId} of ${organisationName}'s chat, from message ` +
		`${decision.messageId}, as raised by the person you act for through their Claude. It waits on account ` +
		`${decision.waitingOnAccountId}; list_chat_decisions names them. No one was emailed or told.`
	);
}

/** The decision as it is closed: its outcome, and that it is never reopened. */
export function describeClosedDecision(organisationName: string, decision: ChatDecision): string {
	return (
		`Decision ${decision.id} of ${organisationName}'s chat is closed, with the outcome:\n${indentedLines(decision.outcome ?? '', wordsIndent)}\n` +
		'A closed decision is never reopened or changed. No one was emailed or told.'
	);
}
