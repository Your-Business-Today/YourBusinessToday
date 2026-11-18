/** Where a story in an organisation's Business News came from, as the news_stories.source column (0265) accepts it. */
export const newsSources = ['gov_uk', 'tender', 'gazette', 'companies_house', 'filed_by_claude'] as const;

export type NewsSource = (typeof newsSources)[number];

export const newsSourceLabels: Record<NewsSource, string> = {
	gov_uk: 'gov.uk',
	tender: 'Tender',
	gazette: 'The Gazette',
	companies_house: 'Companies House',
	filed_by_claude: 'Filed by Claude'
};

/** A person's mark on whether a story touches their business, as the news_story_marks.relevance column (0265) accepts it. */
export const newsRelevances = ['relevant', 'not_relevant'] as const;

export type NewsRelevance = (typeof newsRelevances)[number];

export const newsRelevanceLabels: Record<NewsRelevance, string> = {
	relevant: 'relevant',
	not_relevant: 'not relevant'
};

/** The limits on a story, stated once and mirrored by the checks on migration 0265's columns. */
export const newsStoryLimits = {
	longestHeadline: 300,
	longestLink: 2000,
	longestMatchReason: 300,
	longestNote: 500
} as const;

/** The most new stories one reading hands back and marks seen; the rest wait for the next reading. */
export const newStoriesPerReading = 50;

/** A story as a client's Claude files it, checked by validateFiledStory before anything is written. */
export type FiledStory = {
	headline: string;
	link: string;
	publishedOn: string | null;
	watchedThingId: string | null;
	matchReason: string;
	note: string;
};

/** One story in an organisation's news, as the connector reads it back. */
export type NewsStory = FiledStory & {
	id: string;
	source: NewsSource;
	filedAt: string;
};

export function isNewsRelevance(candidate: string): candidate is NewsRelevance {
	return newsRelevances.some((relevance) => relevance === candidate);
}
