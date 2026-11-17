import { validateFiledStory } from './validateFiledStory';
import { newsStoriesTable, newsStoryColumns, newsStoryOf, type NewsStoryRow } from './newsStoryRecord';
import type { FiledStory, NewsStory } from '$lib/data/news/newsStoryRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const watchListTable = 'news_watch_list';
const filedByClaude = 'filed_by_claude';
const uniqueViolation = '23505';

/** Who files a story into which organisation's news. */
export type NewsFiler = { organisationId: string; filedBy: string };

export const filedStoryOutcomes = {
	notWatched: 'Nothing on this organisation’s watch list has that id; list_news_watch_list gives the ids, or leave watchedThingId out.'
} as const;

/** The story already filed under the link, so the caller is told it is there rather than given it twice. */
export type AlreadyFiled = { alreadyFiled: NewsStory };

/** Files the story once every field fits its column and its watched thing is this organisation's, or says why not. */
export async function fileNewsStory(supabase: SupabaseClient, filer: NewsFiler, input: Record<string, unknown>): Promise<NewsStory | AlreadyFiled | string> {
	const story = validateFiledStory(input);
	if (typeof story === 'string') return story;
	const isWatched = await isOnTheWatchList(supabase, filer.organisationId, story.watchedThingId);
	if (!isWatched) return filedStoryOutcomes.notWatched;
	const { data, error } = await supabase.from(newsStoriesTable).insert(storyRowOf(filer, story)).select(newsStoryColumns).single();
	if (error?.code === uniqueViolation)
		return {
			alreadyFiled: await findStoryByLink(supabase, filer.organisationId, story.link)
		};
	if (error !== null) throw error;
	return newsStoryOf(data as unknown as NewsStoryRow);
}

function storyRowOf(filer: NewsFiler, story: FiledStory) {
	return {
		organisation_id: filer.organisationId,
		source: filedByClaude,
		headline: story.headline,
		link: story.link,
		published_on: story.publishedOn,
		watched_thing_id: story.watchedThingId,
		match_reason: story.matchReason,
		note: story.note,
		filed_by: filer.filedBy
	};
}

async function isOnTheWatchList(supabase: SupabaseClient, organisationId: string, watchedThingId: string | null): Promise<boolean> {
	if (watchedThingId === null) return true;
	const { data, error } = await supabase.from(watchListTable).select('id').eq('organisation_id', organisationId).eq('id', watchedThingId).maybeSingle();
	if (error !== null) throw error;
	return data !== null;
}

async function findStoryByLink(supabase: SupabaseClient, organisationId: string, link: string): Promise<NewsStory> {
	const { data, error } = await supabase.from(newsStoriesTable).select(newsStoryColumns).eq('organisation_id', organisationId).eq('link', link).single();
	if (error !== null) throw error;
	return newsStoryOf(data as unknown as NewsStoryRow);
}
