import { longestMessageBody } from './postMessage';
import { handOffSeparator, parseHandOff, type HandOff } from '$lib/data/conversationTurn';

export type MessageSubmission = { body: string; awaiting: HandOff | null };

export function readMessageForm(formData: FormData): MessageSubmission | null {
	const body = String(formData.get('body') ?? '').trim();
	if (body === '' || body.length > longestMessageBody) return null;
	const [accountId, kind] = String(formData.get('handOff') ?? '').split(handOffSeparator);
	return { body, awaiting: parseHandOff(accountId, kind) };
}

export const messageFormRefusal = `A message needs some words, and fewer than ${longestMessageBody} of them.`;
