import type { Tab } from '$lib/components/workspace/TabStrip.svelte';
import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { tabNamedIn } from '$lib/components/workspace/tabOfAddress';
import type { DomainWord } from '$lib/data/domainReading';
import type { OrganisationDomain } from '$lib/data/organisationDomain';

export const domainTabKeys = { things: 'things', rules: 'rules', words: 'words', map: 'map' } as const;

export type DomainTabKey = (typeof domainTabKeys)[keyof typeof domainTabKeys];

/** The address query naming the tab shown and the thing opened on the Things tab. */
export const domainQueryKeys = { tab: 'tab', thing: 'thing' } as const;

const everyDomainTabKey: DomainTabKey[] = Object.values(domainTabKeys);

/** The tab the address names; Things when it names none or one the page does not have. */
export function domainTabOf(address: URL): DomainTabKey {
	return tabNamedIn(address, domainQueryKeys.tab, everyDomainTabKey, domainTabKeys.things);
}

/** The slug of the thing the address opens on the Things tab, or null when it opens none. */
export function domainThingOf(address: URL): string | null {
	const { searchParams } = address;
	return searchParams.get(domainQueryKeys.thing);
}

export function domainTabHref(tabKey: DomainTabKey): string {
	return `?${domainQueryKeys.tab}=${tabKey}`;
}

/** The Things tab with one thing opened beneath its table. */
export function domainThingHref(thingSlug: string): string {
	return `${domainTabHref(domainTabKeys.things)}&${domainQueryKeys.thing}=${encodeURIComponent(thingSlug)}`;
}

/** The organisation's Domain page with one thing opened, from another page. */
export function organisationThingHref(organisationId: string, thingSlug: string): string {
	return `/organisations/${organisationId}/domain${domainThingHref(thingSlug)}`;
}

/** Today's workflow map with one station chosen. */
export function workflowMapStationHref(organisationId: string, stationKey: string): string {
	return `/organisations/${organisationId}/workflow-map?station=${encodeURIComponent(stationKey)}`;
}

/** Things, Rules and Words, each counting its rows, then Map. */
export function domainTabsFor(domain: OrganisationDomain, words: DomainWord[]): Tab[] {
	const { things, rules } = domain;
	const tab = (key: DomainTabKey, label: string, count: number | null) => ({ key, label, count, href: domainTabHref(key) });
	return [
		tab(domainTabKeys.things, 'Things', countShownOnTab(things.length)),
		tab(domainTabKeys.rules, 'Rules', countShownOnTab(rules.length)),
		tab(domainTabKeys.words, 'Words', countShownOnTab(words.length)),
		tab(domainTabKeys.map, 'Map', null)
	];
}
