import type { Tab } from '$lib/components/workspace/TabStrip.svelte';

/** A tab of an organisation's Overview: its projects, its people, how it is invoiced, its modules and its directors. */
export type OrganisationOverviewTab = 'projects' | 'people' | 'invoicing' | 'modules' | 'directors';

export const organisationOverviewTabs = {
	projects: 'projects',
	people: 'people',
	invoicing: 'invoicing',
	modules: 'modules',
	directors: 'directors'
} as const;

/** What the Overview knows of an organisation that decides its tabs and their counts. */
export type OverviewTabFacts = {
	projectCount: number;
	memberCount: number;
	switchedOnModuleCount: number;
	hasModulesTab: boolean;
	directorCount: number | null;
};

/** The Overview's tabs, Projects first; Modules only for someone who can see one, Directors only with a boardroom. */
export function organisationOverviewTabsFor(facts: OverviewTabFacts): Tab[] {
	const tabs: Tab[] = [
		{ key: organisationOverviewTabs.projects, label: 'Projects', count: facts.projectCount },
		{ key: organisationOverviewTabs.people, label: 'People', count: facts.memberCount },
		{ key: organisationOverviewTabs.invoicing, label: 'Invoicing', count: null }
	];
	if (facts.hasModulesTab)
		tabs.push({ key: organisationOverviewTabs.modules, label: 'Modules', count: facts.switchedOnModuleCount });
	if (facts.directorCount !== null)
		tabs.push({ key: organisationOverviewTabs.directors, label: 'Directors', count: facts.directorCount });
	return tabs;
}
