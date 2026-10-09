import type { HandOff } from './conversationTurn';

export const selfHandOffRefusal =
	'A message waits on someone only for an answer from them, and nobody asks themselves a ' +
	'question. A question for the person you are with goes to them in chat, not into this ' +
	'conversation, where every other Claude on the project would read it as theirs. Something ' +
	'you have to do is a task: assign it to yourself, or raise a subtask for it, and post this ' +
	'message waiting on nobody.';

/** Whether a message's question waits on this account, themselves or their Claude. */
export function isWaitingOn(message: { awaiting: HandOff | null }, accountId: string): boolean {
	const awaiting = message.awaiting;
	return awaiting !== null && awaiting.accountId === accountId;
}

/** The baton is for a question to someone else: a writer never hands it to themselves. */
export function isHandedToWriter(handOff: HandOff | null, writerId: string): boolean {
	return handOff?.accountId === writerId;
}
