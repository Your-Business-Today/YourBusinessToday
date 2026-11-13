import { internalStatusLabels } from '$lib/data/internalStatus';
import { jobsShownBy, nobodyAssigned, type TeamWorkFilter, type TeamWorkFilterField } from '$lib/data/teamWorkFilter';
import { taskStatusOrder, doneTaskStatus } from '$lib/data/taskStatus';
import type { TeamPerson } from '$lib/data/teamPeople';
import type { TeamWorkItem } from '$lib/data/organisationTeamWork';

/** One choice in the filter bar: what it says, how many jobs it would show, and the filter once it is pressed. */
export type FilterChip = { key: string; label: string; title: string; count: number; isSelected: boolean; nextFilter: TeamWorkFilter };

export type FilterChipGroup = { label: string; chips: FilterChip[] };

type Choice = { value: string; label: string; title: string };

const openStatuses = taskStatusOrder.filter((status) => status !== doneTaskStatus);
const fewestProductsWorthFiltering = 2;

const statusChoices: Choice[] = openStatuses.map((status) => {
	const label = internalStatusLabels[status];
	return { value: status, label, title: `Open jobs marked ${label}` };
});

/** The jobs the filter bar works from: the tab's, which its counts are of, and every tab's, which its choices come from. */
export type FilterSource = { tabJobs: TeamWorkItem[]; everyJob: TeamWorkItem[]; people: TeamPerson[]; viewerId: string };

/** The filter bar's groups: who has the jobs, their product, where they stand, each choice counting the tab's jobs it would show. */
export function teamWorkFilterChips(source: FilterSource, filter: TeamWorkFilter): FilterChipGroup[] {
	const chipsFor = (field: TeamWorkFilterField, choices: Choice[]) => choices.map((choice) => chipOf(source.tabJobs, filter, field, choice));
	const productChoices = productChoicesOf(source.everyJob);
	const assigned = { label: 'Owner', chips: chipsFor('assignedTo', assigneeChoicesOf(source)) };
	const products = { label: 'Product', chips: chipsFor('productId', productChoices) };
	const statuses = { label: 'Status', chips: chipsFor('status', statusChoices) };
	const isProductWorthFiltering = productChoices.length >= fewestProductsWorthFiltering;
	return isProductWorthFiltering ? [assigned, products, statuses] : [assigned, statuses];
}

function chipOf(items: TeamWorkItem[], filter: TeamWorkFilter, field: TeamWorkFilterField, choice: Choice): FilterChip {
	const isSelected = filter[field] === choice.value;
	const count = jobsShownBy(items, { ...filter, [field]: choice.value }).length;
	const nextFilter = { ...filter, [field]: isSelected ? null : choice.value };
	return { key: `${field}-${choice.value}`, label: choice.label, title: choice.title, count, isSelected, nextFilter };
}

function assigneeChoicesOf({ everyJob, people, viewerId }: FilterSource): Choice[] {
	const assignedIds = new Set(everyJob.flatMap((item) => item.assigneeIds));
	const others = people.filter((person) => person.id !== viewerId && assignedIds.has(person.id));
	const viewerChoice = { value: viewerId, label: 'Assigned to me', title: 'Open jobs assigned to you' };
	const otherChoices = others.map((person) => ({ value: person.id, label: person.name, title: `Open jobs assigned to ${person.name}` }));
	const nobodyChoice = { value: nobodyAssigned, label: 'Nobody', title: 'Open jobs nobody has taken yet' };
	return [viewerChoice, ...otherChoices, nobodyChoice];
}

function productChoicesOf(items: TeamWorkItem[]): Choice[] {
	const productNames = new Map(items.map((item) => [item.productId, item.productName]));
	const choices = [...productNames].map(([value, label]) => ({ value, label, title: `Open jobs on ${label}` }));
	return choices.sort((first, second) => first.label.localeCompare(second.label));
}
