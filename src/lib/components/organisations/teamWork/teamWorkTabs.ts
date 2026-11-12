import type { Tab } from '$lib/components/workspace/TabStrip.svelte';
import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { teamWorkAcross, type TeamWorkGroup, type TeamWorkItem } from '$lib/data/organisationTeamWork';

/** The Tasks page's first tab: every department's open jobs together. */
export const everyDepartmentTab = 'all';

const everyDepartmentLabel = 'All';

/** The Tasks page's tabs: every open job first, then a tab for each department, each counting its open jobs. */
export function teamWorkTabsFor(groups: TeamWorkGroup[]): Tab[] {
	const everyJob = teamWorkAcross(groups);
	const departmentTabs = groups.map(({ department, label, items }) => ({
		key: department,
		label,
		count: countShownOnTab(items.length)
	}));
	return [{ key: everyDepartmentTab, label: everyDepartmentLabel, count: countShownOnTab(everyJob.length) }, ...departmentTabs];
}

/** The jobs a tab lists: its department's, or every department's on the first tab. */
export function teamWorkOnTab(groups: TeamWorkGroup[], tabKey: string): TeamWorkItem[] {
	const group = groups.find(({ department }) => department === tabKey);
	return group?.items ?? teamWorkAcross(groups);
}
