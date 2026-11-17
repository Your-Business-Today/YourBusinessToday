import { addWatchedThing, findWatchList, removeWatchedThing } from '$lib/server/news/newsWatchList';
import { readWatchListSuggestions } from '$lib/server/news/readWatchListSuggestions';
import { moduleAction } from '../organisationModuleGate';
import { objectSchema, readText } from '../actionTypes';
import { describeNewsWatchList, describeWatchedThing } from './describeNewsWatchList';
import { newsOrganisationField, watchedKindField, watchedLabelField, watchedThingIdField, watchedValueField } from './newsWatchListFields';
import type { McpAction } from '../actionTypes';

const suggestionsAreOffered =
	'Suggestions come from the Domain and the clients register and are never watched until someone adds them; ' +
	'ask the person which to add.';

export const newsWatchListActions: McpAction[] = [
	moduleAction('news', {
		name: 'list_news_watch_list',
		area: 'news',
		audience: 'everyone',
		isWrite: false,
		summary: "list what an organisation's Business News watches — sector codes, regulators and topics, words and companies — with the id of each",
		guidance: suggestionsAreOffered,
		inputSchema: objectSchema({ organisationId: newsOrganisationField }, ['organisationId']),
		run: async (caller, _input, organisation) => {
			const watchList = await findWatchList(caller.supabase, organisation.id);
			const suggestions = caller.isStaff ? await readWatchListSuggestions(caller.supabase, organisation.id, watchList) : [];
			return describeNewsWatchList(organisation.name, watchList, suggestions);
		}
	}),
	moduleAction('news', {
		name: 'add_to_news_watch_list',
		area: 'news',
		audience: 'staff',
		isWrite: true,
		summary: "add a sector code, regulator or topic, word or company to what an organisation's Business News watches",
		guidance: 'List the watch list first: a thing is watched once, and adding it again is refused.',
		inputSchema: objectSchema(
			{ organisationId: newsOrganisationField, kind: watchedKindField, value: watchedValueField, label: watchedLabelField },
			['organisationId', 'kind', 'value']
		),
		run: async (caller, input, organisation) => {
			const keeper = { organisationId: organisation.id, addedBy: caller.accountId };
			const added = await addWatchedThing(caller.supabase, keeper, input);
			if (typeof added === 'string') return added;
			return `${organisation.name}'s Business News now watches:\n${describeWatchedThing(added)}`;
		}
	}),
	moduleAction('news', {
		name: 'remove_from_news_watch_list',
		area: 'news',
		audience: 'staff',
		isWrite: true,
		summary: "take a thing off what an organisation's Business News watches",
		inputSchema: objectSchema({ organisationId: newsOrganisationField, watchedThingId: watchedThingIdField }, ['organisationId', 'watchedThingId']),
		run: async (caller, input, organisation) => {
			const removed = await removeWatchedThing(caller.supabase, organisation.id, readText(input, 'watchedThingId'));
			if (typeof removed === 'string') return removed;
			return `${organisation.name}'s Business News no longer watches:\n${describeWatchedThing(removed)}`;
		}
	})
];
