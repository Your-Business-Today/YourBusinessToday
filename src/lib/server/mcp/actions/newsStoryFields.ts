import { newsRelevances, newsStoryLimits } from '$lib/data/news/newsStoryRules';
import { textField } from '../actionTypes';

const { longestHeadline, longestLink, longestMatchReason, longestNote } = newsStoryLimits;

export const storyHeadlineField = textField(`The story's own headline, as the page gives it, at most ${longestHeadline} characters`);

export const storyLinkField = textField(
	`The full web address of the public page you read the story on, starting https://, at most ${longestLink} characters. ` + 'A story is filed once per link'
);

export const storyPublishedOnField = textField('The day the story was published, as YYYY-MM-DD; leave out when the page does not say');

export const storyWatchedThingIdField = textField('Leave out, or the id of the watched thing the story matched, as list_news_watch_list gives it');

export const storyMatchReasonField = textField(
	`Why the story matched that watched thing, in a short line, at most ${longestMatchReason} characters; needed with watchedThingId`
);

export const storyNoteField = textField(
	`One or two lines on why the story matters to this organisation, in your own words, at most ${longestNote} characters. ` + "Never the article's text"
);

export const storyIdField = textField('The id of the story, as catch_up_on_news or file_news_story gives it');

export const storyRelevanceField = {
	type: 'string',
	enum: [...newsRelevances],
	description: 'Whether the story touches the business: relevant or not_relevant. The mark is the caller’s own'
};
