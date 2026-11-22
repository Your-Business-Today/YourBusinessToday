import { checkRequiredWords } from '$lib/data/fieldChecks';
import { chatMessageLimits, chatMessageRefusals } from './chatMessageRules';

export type ChatMessageBody = { body: string };

/** The words as given, checked against the body's column, or the sentence naming the limit they break. */
export function validateChatMessageBody(input: Record<string, unknown>): ChatMessageBody | string {
	const checked = checkRequiredWords(input.body, chatMessageLimits.longestBody, chatMessageRefusals.body);
	if ('refusal' in checked) return checked.refusal;
	return { body: checked.value };
}
