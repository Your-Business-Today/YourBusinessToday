import { askedChatbotTrailOf } from '$lib/data/businessBrainChatbotTrailQuery';
import { validateChatbotTrailFilters } from '$lib/server/businessBrain/validateChatbotTrailFilters';
import type { ChatbotTrailFilters } from '$lib/data/businessBrainChatbotTrailRules';

/** The filters the address asks for on one chatbot's record, checked as the connector checks them, or the sentence naming the one that does not fit. */
export function readAskedChatbotTrail(url: URL, chatbotId: string): ChatbotTrailFilters | string {
	const asked = askedChatbotTrailOf(url.searchParams);
	return validateChatbotTrailFilters({ chatbotId, ...asked });
}
