import { trimmedText } from '$lib/data/trimmedText';
import { chatMessageLimits, chatMessageRefusals } from './chatMessageRules';

export type ChatMessageBody = { body: string };

/** The words as given, checked against the body's column, or the sentence naming the limit they break. */
export function validateChatMessageBody(input: Record<string, unknown>): ChatMessageBody | string {
	const body = trimmedText(input.body);
	if (body === '' || body.length > chatMessageLimits.longestBody) return chatMessageRefusals.body;
	return { body };
}
