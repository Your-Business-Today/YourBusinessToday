import { newsSourceLabels, type NewsStory } from '$lib/data/news/newsStoryRules';
import type { NewStoriesReading } from '$lib/server/news/readNewNewsStories';
import type { AlreadyFiled } from '$lib/server/news/fileNewsStory';

const nothingNew = 'Nothing new since you last looked.';
const moreWaiting = 'More new stories are waiting: call catch_up_on_news again for them.';

/** One story as a few lines: its headline and link, where it came from, what it matched, the note, and its id. */
export function describeNewsStory(story: NewsStory): string {
	const published = story.publishedOn === null ? '' : `, published ${story.publishedOn}`;
	const lines = [`- ${story.headline}`, `  ${story.link}`, `  ${newsSourceLabels[story.source]}${published}, id ${story.id}`];
	if (story.matchReason !== '') lines.push(`  Matched: ${story.matchReason}`);
	if (story.note !== '') lines.push(`  Why it matters: ${story.note}`);
	return lines.join('\n');
}

/** The stories new to the caller in an organisation's news, and whether more wait for the next reading. */
export function describeNewStories(organisationName: string, reading: NewStoriesReading): string {
	const { stories, isMoreWaiting } = reading;
	if (stories.length === 0) return `${organisationName}'s Business News: ${nothingNew}`;
	const opening = `New in ${organisationName}'s Business News since you last looked, now marked seen by you:`;
	const lines = [opening, ...stories.map(describeNewsStory)];
	if (isMoreWaiting) lines.push('', moreWaiting);
	return lines.join('\n');
}

/** What came of filing a story: the story filed, the one already filed under its link, or why nothing was filed. */
export function describeFiledStory(organisationName: string, filed: NewsStory | AlreadyFiled | string): string {
	if (typeof filed === 'string') return filed;
	if ('alreadyFiled' in filed)
		return `That link is already in ${organisationName}'s Business News, so it was not filed again:\n${describeNewsStory(filed.alreadyFiled)}`;
	return `Filed in ${organisationName}'s Business News:\n${describeNewsStory(filed)}`;
}
