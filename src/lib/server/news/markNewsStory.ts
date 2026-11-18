import { validateRecordId } from '$lib/data/isUuid';
import { trimmedText } from '$lib/data/trimmedText';
import { isNewsRelevance, newsRelevances, type NewsRelevance, type NewsStory } from '$lib/data/news/newsStoryRules';
import { newsStoriesTable, newsStoryColumns, newsStoryMarksTable, newsStoryOf, type NewsStoryRow } from './newsStoryRecord';
import type { NewsReader } from './readNewNewsStories';
import type { SupabaseClient } from '@supabase/supabase-js';

export const markRefusals = {
	relevance: `The mark is one of ${newsRelevances.join(', ')}.`,
	notInTheNews: 'Nothing in this organisation’s news has that id; catch_up_on_news gives the ids.'
} as const;

/** The story as marked, and the mark the reader gave it. */
export type MarkedStory = { story: NewsStory; relevance: NewsRelevance };

/** Marks the story relevant or not for the reader alone, seen as well, or says why nothing was marked. */
export async function markNewsStory(supabase: SupabaseClient, reader: NewsReader, input: Record<string, unknown>): Promise<MarkedStory | string> {
	const storyId = trimmedText(input.storyId);
	const idRefusal = validateRecordId('story', storyId);
	if (idRefusal !== null) return idRefusal;
	const relevance = trimmedText(input.relevance);
	if (!isNewsRelevance(relevance)) return markRefusals.relevance;
	const story = await findStory(supabase, reader.organisationId, storyId);
	if (story === null) return markRefusals.notInTheNews;
	const mark = {
		story_id: story.id,
		account_id: reader.accountId,
		relevance,
		marked_at: new Date().toISOString()
	};
	const { error } = await supabase.from(newsStoryMarksTable).upsert(mark, { onConflict: 'story_id,account_id' });
	if (error !== null) throw error;
	return { story, relevance };
}

async function findStory(supabase: SupabaseClient, organisationId: string, storyId: string): Promise<NewsStory | null> {
	const { data, error } = await supabase.from(newsStoriesTable).select(newsStoryColumns).eq('organisation_id', organisationId).eq('id', storyId).maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return newsStoryOf(data as unknown as NewsStoryRow);
}
