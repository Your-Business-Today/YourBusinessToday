import { isWaitingOn } from './batonRule';
import type { ConversationTurn } from './conversationTurn';

export type TurnMessage = Pick<
	ConversationTurn,
	'authorAccountId' | 'postedVia' | 'awaiting' | 'pickedUpAt'
> & { createdAt: string };

/**
 * A thread's turn: the question still open on it, if one is, else its latest message.
 * A question stays open until the person it waits on speaks on the thread after it.
 */
export function currentTurn(messages: TurnMessage[]): ConversationTurn | null {
	const turnMessage = openQuestion(messages) ?? messages.at(-1);
	if (turnMessage === undefined) return null;
	return turnOf(turnMessage);
}

/** The latest message that asks someone a question they have not spoken on since. */
export function openQuestion(messages: TurnMessage[]): TurnMessage | null {
	const questions = messages.filter((message) => message.awaiting !== null);
	const stillOpen = questions.filter((question) => !hasBeenAnswered(question, messages));
	return stillOpen.at(-1) ?? null;
}

function hasBeenAnswered(question: TurnMessage, messages: TurnMessage[]): boolean {
	const laterMessages = messages.filter((message) => message.createdAt > question.createdAt);
	return laterMessages.some((message) => isWaitingOn(question, message.authorAccountId));
}

function turnOf(message: TurnMessage): ConversationTurn {
	return {
		authorAccountId: message.authorAccountId,
		postedVia: message.postedVia,
		awaiting: message.awaiting,
		pickedUpAt: message.pickedUpAt,
		since: message.createdAt
	};
}
