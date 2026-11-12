import type { Tab } from '$lib/components/workspace/TabStrip.svelte';
import type { BadgeTone } from '$lib/components/site/badgeTones';
import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { projectStatusFilterLabel, projectStatusFilterOrder, type ProjectStatusFilter } from '$lib/data/projectStatusFilter';

/** The Projects page's first tab, there only while a question waits on the viewer. */
export const priorityTab = 'priority';

const waitingCountTone: BadgeTone = 'negative';

/** The Projects page's tabs: Priority while something waits on the viewer, then one tab for each status filter. */
export function projectsTabsFor(waitingCount: number, statusCounts: Map<ProjectStatusFilter, number>): Tab[] {
	const statusTabs = projectStatusFilterOrder.map((status) => ({
		key: status,
		label: projectStatusFilterLabel(status),
		count: countShownOnTab(statusCounts.get(status))
	}));
	if (waitingCount === 0) return statusTabs;
	return [{ key: priorityTab, label: 'Priority', count: waitingCount, countTone: waitingCountTone }, ...statusTabs];
}

/** The status filter a tab stands for, or null for the Priority tab. */
export function statusFilterOfTab(key: string): ProjectStatusFilter | null {
	return projectStatusFilterOrder.find((status) => status === key) ?? null;
}
