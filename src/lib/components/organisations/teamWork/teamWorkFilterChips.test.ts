import { describe, expect, it } from 'vitest';
import { teamWorkFilterChips } from './teamWorkFilterChips';
import { everyJob as noFilter, nobodyAssigned } from '$lib/data/teamWorkFilter';
import { departments } from '$lib/data/department';
import { taskStatuses } from '$lib/data/taskStatus';
import type { TeamWorkItem } from '$lib/data/organisationTeamWork';

const people = [
	{ id: 'james', name: 'James' },
	{ id: 'jeremy', name: 'Jeremy' },
	{ id: 'nigel', name: 'Nigel' }
];

function jobOf(id: string, productName: string, assigneeIds: string[]): TeamWorkItem {
	const department = departments.administration;
	const status = taskStatuses.backlog;
	return { id, title: id, department, status, dueDate: null, productId: productName, productName, assigneeIds, href: `/${id}` };
}

const tabJobs = [jobOf('insurance', 'YBT', ['james']), jobOf('stripe', 'YBT', ['jeremy']), jobOf('listing', 'Carp Mania', [])];
const everyJob = [...tabJobs, jobOf('pitch', 'Brain', ['jeremy'])];
const source = { tabJobs, everyJob, people, viewerId: 'james' };

const summaryOf = (groupIndex: number, filter = noFilter) =>
	teamWorkFilterChips(source, filter)[groupIndex].chips.map(({ label, count, isSelected }) => [label, count, isSelected]);

describe('teamWorkFilterChips', () => {
	it('offers me first, then whoever has a job, then nobody, each counting the tab’s jobs', () => {
		expect(summaryOf(0)).toEqual([
			['Assigned to me', 1, false],
			['Jeremy', 1, false],
			['Nobody', 1, false]
		]);
	});

	it('offers every product with a job, by name, counting only what the other filters let through', () => {
		const filter = { ...noFilter, assignedTo: nobodyAssigned };
		expect(summaryOf(1, filter)).toEqual([
			['Brain', 0, false],
			['Carp Mania', 1, false],
			['YBT', 0, false]
		]);
	});

	it('marks the chosen chip, and pressing it again lets every job through', () => {
		const filter = { ...noFilter, status: taskStatuses.backlog };
		const [, , statuses] = teamWorkFilterChips(source, filter);
		const notStarted = statuses.chips[0];
		expect([notStarted.label, notStarted.isSelected, notStarted.nextFilter]).toEqual(['Not started', true, noFilter]);
	});
});
