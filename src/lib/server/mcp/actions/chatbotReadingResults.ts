import { chatbotReadingOutcomes, type ChatbotPageGiven, type ChatbotReading, type ChatbotReadingAsked } from '$lib/data/businessBrainChatbotTrailRules';

const nothingAsked: ChatbotReadingAsked = { searchWords: null, part: null, pageId: null, revisionId: null };

type PageAsListed = { pageId: string; title: string; updatedAt: string };

/** A reading refused before anything was given back, with whatever it asked for that fitted. */
export function refusedReading(answer: string, asked: Partial<ChatbotReadingAsked> = {}): ChatbotReading {
	return { answer, outcome: chatbotReadingOutcomes.refused, asked: { ...nothingAsked, ...asked }, pagesGiven: [] };
}

/** A reading that ran: it gave back the pages named, or found nothing when there are none. */
export function readingThatGave(answer: string, asked: Partial<ChatbotReadingAsked>, pagesGiven: ChatbotPageGiven[]): ChatbotReading {
	const hasGivenPages = pagesGiven.length > 0;
	const outcome = hasGivenPages ? chatbotReadingOutcomes.given : chatbotReadingOutcomes.nothingFound;
	return { answer, outcome, asked: { ...nothingAsked, ...asked }, pagesGiven };
}

/** A page as an index or a search listed it, as it was last filed. */
export function pageAsListed(page: PageAsListed): ChatbotPageGiven {
	return { pageId: page.pageId, title: page.title, filedAt: page.updatedAt, revisionId: null };
}
