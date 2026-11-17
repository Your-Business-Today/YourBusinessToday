import type { NewsSource, NewsStory } from '$lib/data/news/newsStoryRules';

export const newsStoriesTable = 'news_stories';
export const newsStoryMarksTable = 'news_story_marks';

export const newsStoryColumns = 'id, source, headline, link, published_on, watched_thing_id, match_reason, note, filed_at';

export type NewsStoryRow = {
	id: string;
	source: NewsSource;
	headline: string;
	link: string;
	published_on: string | null;
	watched_thing_id: string | null;
	match_reason: string;
	note: string;
	filed_at: string;
};

export function newsStoryOf(row: NewsStoryRow): NewsStory {
	return {
		id: row.id,
		source: row.source,
		headline: row.headline,
		link: row.link,
		publishedOn: row.published_on,
		watchedThingId: row.watched_thing_id,
		matchReason: row.match_reason,
		note: row.note,
		filedAt: row.filed_at
	};
}
