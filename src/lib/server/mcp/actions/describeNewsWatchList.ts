import { watchedKindLabels, type WatchedThingGiven } from '$lib/data/news/watchListRules';

const nothingWatched = 'It watches nothing yet.';

/** One watched thing as a line: its kind, value, what it is called, and its id when it has one. */
export function describeWatchedThing(watched: WatchedThingGiven & { id?: string }): string {
	const called = watched.label === '' ? '' : ` (${watched.label})`;
	const id = watched.id === undefined ? '' : `, id ${watched.id}`;
	return `- ${watchedKindLabels[watched.kind]}: ${watched.value}${called}${id}`;
}

/** The organisation's watch list, then the suggestions it might tick, when there are any to offer. */
export function describeNewsWatchList(organisationName: string, watchList: (WatchedThingGiven & { id: string })[], suggestions: WatchedThingGiven[]): string {
	const watchedLines = watchList.length === 0 ? [nothingWatched] : watchList.map(describeWatchedThing);
	const opening = `What ${organisationName}'s Business News watches:`;
	if (suggestions.length === 0) return [opening, ...watchedLines].join('\n');
	const suggestionOpening = 'Suggested from its Domain and clients register, not watched until added with add_to_news_watch_list:';
	return [opening, ...watchedLines, '', suggestionOpening, ...suggestions.map(describeWatchedThing)].join('\n');
}
