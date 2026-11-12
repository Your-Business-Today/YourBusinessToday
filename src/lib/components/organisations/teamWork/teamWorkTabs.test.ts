import { describe, expect, it } from 'vitest';
import { everyDepartmentTab, teamWorkOnTab, teamWorkTabsFor } from './teamWorkTabs';
import { teamWorkGroups } from '$lib/data/organisationTeamWork';
import { departments } from '$lib/data/department';
import { taskStatuses } from '$lib/data/taskStatus';

const harbour = { id: 'harbour', name: 'Harbour site' };

function taskOf(id: string, department: (typeof departments)[keyof typeof departments], dueDate: string | null) {
	return { id, projectId: harbour.id, department, title: id, status: taskStatuses.backlog, dueDate };
}

const groups = teamWorkGroups(
	[
		taskOf('insurance', departments.administration, '2026-11-20'),
		taskOf('accounts', departments.administration, null),
		taskOf('pitch', departments.sales, '2026-11-12')
	],
	[harbour]
);

describe('teamWorkTabsFor', () => {
	it('opens with every open job, then a tab for each department, each counted', () => {
		expect(teamWorkTabsFor(groups).map(({ key, label, count }) => [key, label, count])).toEqual([
			[everyDepartmentTab, 'All', 3],
			[departments.administration, 'Administration', 2],
			[departments.sales, 'Sales', 1],
			[departments.marketing, 'Marketing', null]
		]);
	});
});

describe('teamWorkOnTab', () => {
	it('lists every department’s jobs on the first tab, the soonest due first', () => {
		expect(teamWorkOnTab(groups, everyDepartmentTab).map(({ id }) => id)).toEqual(['pitch', 'insurance', 'accounts']);
	});

	it('lists only a department’s own jobs on its tab', () => {
		expect(teamWorkOnTab(groups, departments.administration).map(({ id }) => id)).toEqual(['insurance', 'accounts']);
		expect(teamWorkOnTab(groups, departments.marketing)).toEqual([]);
	});
});
