import type { BusinessBrainPartKind } from './businessBrainRules';

/** The limits on the record of questions asked through a chatbot, stated once and mirrored by migration 0175. */
export const chatbotTrailLimits = {
	longestQuestion: 2000,
	longestAnswer: 20000,
	longestRefusal: 2000,
	mostPagesCited: 50,
	mostQuestionsListed: 100
} as const;

/** The three readings a person's Claude makes through a chatbot, as business_brain_chatbot_readings.reading accepts them. */
export const chatbotReadingKinds = { index: 'index', search: 'search', page: 'page' } as const;

export type ChatbotReadingKind = (typeof chatbotReadingKinds)[keyof typeof chatbotReadingKinds];

/** What came of a reading, as business_brain_chatbot_readings.outcome accepts it. */
export const chatbotReadingOutcomes = { given: 'given', nothingFound: 'nothing_found', refused: 'refused' } as const;

export type ChatbotReadingOutcome = (typeof chatbotReadingOutcomes)[keyof typeof chatbotReadingOutcomes];

/** A page a reading gave back, as it stood: as last filed, or the earlier version named by its revision. */
export type ChatbotPageGiven = { pageId: string; title: string; filedAt: string; revisionId: number | null };

/** What a reading asked for, once its values fit their columns. */
export type ChatbotReadingAsked = {
	searchWords: string | null;
	part: BusinessBrainPartKind | null;
	pageId: string | null;
	revisionId: number | null;
};

/** One reading as Your Business Today saw it: what it answered, what it asked for and what it gave back. */
export type ChatbotReading = {
	answer: string;
	outcome: ChatbotReadingOutcome;
	asked: ChatbotReadingAsked;
	pagesGiven: ChatbotPageGiven[];
};

/** The question a reading is for: new words, or the question already on record that it carries on. */
export type ChatbotQuestionAsked = { question: string; questionId: string | null };

/** Who asked, as they were when they asked. */
export type ChatbotAsker = { accountId: string; email: string };

/** An answer the person's Claude reports it gave, with the pages it cited. */
export type ChatbotAnswerGiven = { questionId: string; answer: string; pagesCited: string[] };

/** Which questions a manager reads: all of the organisation's, or narrowed by chatbot, person and days. */
export type ChatbotTrailFilters = {
	chatbotId: string | null;
	email: string | null;
	fromDay: string | null;
	toDay: string | null;
};
