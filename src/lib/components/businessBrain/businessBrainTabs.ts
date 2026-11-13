import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { tabNamedIn } from '$lib/components/workspace/tabOfAddress';
import type { Tab } from '$lib/components/workspace/TabStrip.svelte';

export const businessBrainTabKeys = { pages: 'pages', files: 'files', brains: 'brains' } as const;

export type BusinessBrainTabKey = (typeof businessBrainTabKeys)[keyof typeof businessBrainTabKeys];

/** How many of each the brain holds, as its tabs count them. */
export type BusinessBrainCounts = { pageCount: number; fileCount: number; brainCount: number };

const tabQueryKey = 'tab';
const everyTabKey: BusinessBrainTabKey[] = Object.values(businessBrainTabKeys);

/** The tab the address names; Pages when it names none or one the page does not have. */
export function businessBrainTabOf(address: URL): BusinessBrainTabKey {
	return tabNamedIn(address, tabQueryKey, everyTabKey, businessBrainTabKeys.pages);
}

/** Pages, Files and Brains, each counting what it holds. */
export function businessBrainTabsFor(counts: BusinessBrainCounts): Tab[] {
	const tab = (key: BusinessBrainTabKey, label: string, count: number) => ({
		key,
		label,
		count: countShownOnTab(count),
		href: `?${tabQueryKey}=${key}`
	});
	return [
		tab(businessBrainTabKeys.pages, 'Pages', counts.pageCount),
		tab(businessBrainTabKeys.files, 'Files', counts.fileCount),
		tab(businessBrainTabKeys.brains, 'Brains', counts.brainCount)
	];
}
