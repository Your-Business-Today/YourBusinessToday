import { formatBritishDate } from '$lib/data/britishDate';
import { taskStatusLabels } from '$lib/data/taskStatus';
import type { TeamPerson } from '$lib/data/teamPeople';
import type { TeamWorkGroup, TeamWorkItem } from '$lib/data/organisationTeamWork';

const noDueDate = 'no due date';
const noOwner = 'no owner';

export const noTeamWork = (organisationName: string) => `The team has no open jobs across ${organisationName}'s products that match.`;

/** The team's open jobs as the organisation's Tasks page shows them: a group per department, the soonest due first, each with its owners. */
export function describeTeamWork(groups: TeamWorkGroup[], organisationName: string, people: TeamPerson[]): string {
	const openGroups = groups.filter(hasOpenJobs);
	if (openGroups.length === 0) return noTeamWork(organisationName);
	const namesById = new Map(people.map((person) => [person.id, person.name]));
	return openGroups.map((group) => describeGroup(group, namesById)).join('\n\n');
}

function hasOpenJobs({ items }: TeamWorkGroup): boolean {
	return items.length > 0;
}

function describeGroup({ label, items }: TeamWorkGroup, namesById: Map<string, string>): string {
	return [`${label} (${items.length}):`, ...items.map((item) => describeItem(item, namesById))].join('\n');
}

function describeItem(item: TeamWorkItem, namesById: Map<string, string>): string {
	const due = item.dueDate === null ? noDueDate : `due ${formatBritishDate(item.dueDate)}`;
	const owners = ownersOf(item, namesById);
	return `${item.title} — ${item.productName} — ${taskStatusLabels[item.status]} — ${owners} — ${due} — task ${item.id}`;
}

function ownersOf(item: TeamWorkItem, namesById: Map<string, string>): string {
	const names = item.assigneeIds.map((assigneeId) => namesById.get(assigneeId) ?? assigneeId);
	if (names.length === 0) return noOwner;
	return `owned by ${names.join(', ')}`;
}
