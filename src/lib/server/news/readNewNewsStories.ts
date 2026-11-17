import { newStoriesPerReading, type NewsStory } from '$lib/data/news/newsStoryRules';
import { newsStoryMarksTable, newsStoryOf, type NewsStoryRow } from './newsStoryRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

const unseenStoriesFunction = 'news_stories_unseen_by';

/** Who is reading which organisation's news. */
export type NewsReader = { organisationId: string; accountId: string };

/** The stories new to the reader in this reading, and whether more wait for the next. */
export type NewStoriesReading = {
	stories: NewsStory[];
	isMoreWaiting: boolean;
};

/** The stories the reader has not seen yet, oldest first, each marked seen by them as it is handed back. */
export async function readNewNewsStories(supabase: SupabaseClient, reader: NewsReader): Promise<NewStoriesReading> {
	const unseen = await findUnseenStories(supabase, reader);
	const stories = unseen.slice(0, newStoriesPerReading);
	await markSeen(supabase, reader.accountId, stories);
	return { stories, isMoreWaiting: unseen.length > newStoriesPerReading };
}

async function findUnseenStories(supabase: SupabaseClient, reader: NewsReader): Promise<NewsStory[]> {
	const lookingOneFurther = newStoriesPerReading + 1;
	const { data, error } = await supabase.rpc(unseenStoriesFunction, {
		organisation: reader.organisationId,
		reader: reader.accountId,
		how_many: lookingOneFurther
	});
	if (error !== null) throw error;
	return (data as NewsStoryRow[]).map(newsStoryOf);
}

async function markSeen(supabase: SupabaseClient, accountId: string, stories: NewsStory[]): Promise<void> {
	if (stories.length === 0) return;
	const marks = stories.map((story) => ({
		story_id: story.id,
		account_id: accountId
	}));
	const { error } = await supabase.from(newsStoryMarksTable).upsert(marks, {
		onConflict: 'story_id,account_id',
		ignoreDuplicates: true
	});
	if (error !== null) throw error;
}
