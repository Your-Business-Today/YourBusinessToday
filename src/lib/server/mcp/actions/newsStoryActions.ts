import { fileNewsStory } from '$lib/server/news/fileNewsStory';
import { readNewNewsStories } from '$lib/server/news/readNewNewsStories';
import { markNewsStory } from '$lib/server/news/markNewsStory';
import { newsRelevanceLabels } from '$lib/data/news/newsStoryRules';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema } from '../actionTypes';
import { describeFiledStory, describeNewStories, describeNewsStory } from './describeNewsStory';
import { newsOrganisationField } from './newsWatchListFields';
import { newsFilingDoctrine } from './newsFilingDoctrine';
import {
	storyHeadlineField,
	storyIdField,
	storyLinkField,
	storyMatchReasonField,
	storyNoteField,
	storyPublishedOnField,
	storyRelevanceField,
	storyWatchedThingIdField
} from './newsStoryFields';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const readerOf = (caller: McpCaller, organisation: Organisation) => ({
	organisationId: organisation.id,
	accountId: caller.accountId
});

const filedStoryFields = {
	organisationId: newsOrganisationField,
	headline: storyHeadlineField,
	link: storyLinkField,
	publishedOn: storyPublishedOnField,
	watchedThingId: storyWatchedThingIdField,
	matchReason: storyMatchReasonField,
	note: storyNoteField
};

export const newsStoryActions: McpAction[] = [
	moduleAction('news', {
		name: 'file_news_story',
		area: 'news',
		audience: 'everyone',
		isWrite: true,
		summary: "file a story you found on a public page into an organisation's Business News: its headline, link and a line on why it matters",
		guidance: newsFilingDoctrine,
		inputSchema: objectSchema(filedStoryFields, ['organisationId', 'headline', 'link', 'note']),
		run: async (caller, input, organisation) => {
			const filer = { organisationId: organisation.id, filedBy: caller.accountId };
			const filed = await fileNewsStory(caller.supabase, filer, input);
			return describeFiledStory(organisation.name, filed);
		}
	}),
	moduleAction('news', {
		name: 'catch_up_on_news',
		area: 'news',
		audience: 'everyone',
		isWrite: true,
		summary: "read what is new in an organisation's Business News since you last looked, oldest first, and mark it seen by you, so no story comes back twice",
		guidance: 'Bring the person the stories that touch their business, each with its link, and mark each one relevant or not with mark_news_story as they say.',
		inputSchema: objectSchema({ organisationId: newsOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) => {
			const reading = await readNewNewsStories(caller.supabase, readerOf(caller, organisation));
			return describeNewStories(organisation.name, reading);
		}
	}),
	moduleAction('news', {
		name: 'mark_news_story',
		area: 'news',
		audience: 'everyone',
		isWrite: true,
		summary: "mark a story in an organisation's Business News relevant or not relevant to you; the mark is yours alone",
		inputSchema: objectSchema(
			{
				organisationId: newsOrganisationField,
				storyId: storyIdField,
				relevance: storyRelevanceField
			},
			['organisationId', 'storyId', 'relevance']
		),
		run: async (caller, input, organisation) => {
			const marked = await markNewsStory(caller.supabase, readerOf(caller, organisation), input);
			if (typeof marked === 'string') return marked;
			return `Marked ${newsRelevanceLabels[marked.relevance]} for you:\n${describeNewsStory(marked.story)}`;
		}
	})
];
