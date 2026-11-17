import { organisationsCrumb } from '$lib/components/organisations/organisationCrumbs';
import type { Crumb } from '$lib/components/workspace/projectCrumbs';
import type { Tab } from '$lib/components/workspace/TabStrip.svelte';

export const newsTitle = 'Business News';

export const watchListTab = 'watch-list';

/** The tabs of the organisation's Business News page; the stories join the watch list here as their own step is built. */
export function newsTabs(watchedCount: number): Tab[] {
	return [{ key: watchListTab, label: 'Watch list', count: watchedCount }];
}

export function newsCrumbsFor(organisation: { id: string; name: string }): Crumb[] {
	return [organisationsCrumb, { label: organisation.name, href: `/organisations/${organisation.id}` }];
}
