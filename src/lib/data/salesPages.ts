import type { NavigationLink } from '$lib/components/site/siteNavigation';

/** One of the sales pages the Sales module gathers, and what it is for. */
export type SalesPage = NavigationLink & { purpose: string };

/** The sales pages that left the side bar for the Sales module; their records stay where they are. */
export const salesPages: SalesPage[] = [
	{ href: '/clients/patches', label: 'Territories', purpose: 'The ground being worked, territory by territory, across the whole country.' },
	{ href: '/clients/feed', label: 'Territory feed', purpose: 'What has happened on that ground, day by day.' },
	{ href: '/people', label: 'People', purpose: 'The directors and owners being pursued, across every company they hold.' }
];
