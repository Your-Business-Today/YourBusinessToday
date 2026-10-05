import type { HandOff } from './conversationTurn';

export const selfHandOffRefusal =
	'A message waits on someone only for an answer from them, and nobody asks themselves a ' +
	'question. Something you have to do is a task: assign it to yourself, or raise a subtask ' +
	'for it, and post this message waiting on nobody.';

/** The baton is for a question to someone else: a writer never hands it to themselves. */
export function isHandedToWriter(handOff: HandOff | null, writerId: string): boolean {
	return handOff?.accountId === writerId;
}
