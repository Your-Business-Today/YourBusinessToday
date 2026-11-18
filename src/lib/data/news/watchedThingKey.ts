import type { WatchedThingGiven } from './watchListRules';

/** The one key a watched thing has on an organisation's list: its kind and its value, as the column's uniqueness holds them. */
export function watchedThingKey({ kind, value }: Pick<WatchedThingGiven, 'kind' | 'value'>): string {
	return `${kind}:${value}`;
}
