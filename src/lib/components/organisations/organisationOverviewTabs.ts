import type { Tab } from '$lib/components/workspace/TabStrip.svelte';
import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';

/** A tab of an organisation's Overview: its people, its details as a client, its modules and its directors. */
export type OrganisationOverviewTab = 'people' | 'details' | 'modules' | 'directors';

export const organisationOverviewTabs = {
	people: 'people',
	details: 'details',
	modules: 'modules',
	directors: 'directors'
} as const;

/** What the Overview knows of an organisation that decides its tabs and their counts. */
export type OverviewTabFacts = {
	memberCount: number;
	switchedOnModuleCount: number;
	hasModulesTab: boolean;
	directorCount: number | null;
};

/** The Overview's tabs, People first; Modules only for someone who can see one, Directors only with a boardroom. */
export function organisationOverviewTabsFor(facts: OverviewTabFacts): Tab[] {
	const tabs: Tab[] = [
		{ key: organisationOverviewTabs.people, label: 'People', count: countShownOnTab(facts.memberCount) },
		{ key: organisationOverviewTabs.details, label: 'Details', count: null }
	];
	if (facts.hasModulesTab)
		tabs.push({ key: organisationOverviewTabs.modules, label: 'Modules', count: countShownOnTab(facts.switchedOnModuleCount) });
	if (facts.directorCount !== null)
		tabs.push({ key: organisationOverviewTabs.directors, label: 'Directors', count: countShownOnTab(facts.directorCount) });
	return tabs;
}
