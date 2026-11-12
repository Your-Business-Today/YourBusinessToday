import type { Tab } from '$lib/components/workspace/TabStrip.svelte';
import type { BadgeTone } from '$lib/components/site/badgeTones';
import { countShownOnTab } from '$lib/components/workspace/countShownOnTab';
import { projectStatusFilterLabel, projectStatusFilterOrder, type ProjectStatusFilter } from '$lib/data/projectStatusFilter';
import { priorityTasksTab } from '$lib/data/projectsTab';

const waitingCountTone: BadgeTone = 'negative';

/** The Projects page's tabs: Priority tasks, set apart, while something waits on the viewer, then one tab for each status. */
export function projectsTabsFor(waitingCount: number, statusCounts: Map<ProjectStatusFilter, number>): Tab[] {
	const statusTabs = projectStatusFilterOrder.map((status) => ({
		key: status,
		label: projectStatusFilterLabel(status),
		count: countShownOnTab(statusCounts.get(status))
	}));
	if (waitingCount === 0) return statusTabs;
	const priorityTasks: Tab = {
		key: priorityTasksTab,
		label: 'Priority tasks',
		count: waitingCount,
		countTone: waitingCountTone,
		isSetApart: true
	};
	return [priorityTasks, ...statusTabs];
}
