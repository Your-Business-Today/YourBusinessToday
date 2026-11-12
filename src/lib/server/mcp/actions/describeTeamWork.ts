import { formatBritishDate } from '$lib/data/britishDate';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { TeamWorkGroup, TeamWorkItem } from '$lib/data/organisationTeamWork';

const noDueDate = 'no due date';

export const noTeamWork = (organisationName: string) => `The team has no open jobs across ${organisationName}'s products.`;

/** The team's open jobs as the organisation's Tasks page shows them: a group per department, the soonest due first. */
export function describeTeamWork(groups: TeamWorkGroup[], organisationName: string): string {
	const openGroups = groups.filter(hasOpenJobs);
	if (openGroups.length === 0) return noTeamWork(organisationName);
	return openGroups.map(describeGroup).join('\n\n');
}

function hasOpenJobs({ items }: TeamWorkGroup): boolean {
	return items.length > 0;
}

function describeGroup({ label, items }: TeamWorkGroup): string {
	return [`${label} (${items.length}):`, ...items.map(describeItem)].join('\n');
}

function describeItem(item: TeamWorkItem): string {
	const due = item.dueDate === null ? noDueDate : `due ${formatBritishDate(item.dueDate)}`;
	return `${item.title} — ${item.productName} — ${taskStatusLabels[item.status]} — ${due} — task ${item.id}`;
}
