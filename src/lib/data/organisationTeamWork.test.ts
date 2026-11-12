import { describe, expect, it } from 'vitest';
import { teamWorkAcross, teamWorkGroups } from './organisationTeamWork';
import { departments } from './department';
import { taskStatuses } from './taskStatus';

const harbour = { id: 'harbour', name: 'Harbour site' };
const meadow = { id: 'meadow', name: 'Meadow app' };

function taskOf(id: string, projectId: string, department: (typeof departments)[keyof typeof departments], dueDate: string | null) {
	return { id, projectId, department, title: id, status: taskStatuses.backlog, dueDate };
}

describe('teamWorkGroups', () => {
	const groups = teamWorkGroups(
		[
			taskOf('insurance', harbour.id, departments.administration, null),
			taskOf('accounts', meadow.id, departments.administration, '2026-11-20'),
			taskOf('pitch', meadow.id, departments.sales, '2026-11-12')
		],
		[harbour, meadow]
	);

	it('groups every product’s jobs by department, Administration, Sales, then Marketing', () => {
		expect(groups.map(({ label, items }) => [label, items.length])).toEqual([
			['Administration', 2],
			['Sales', 1],
			['Marketing', 0]
		]);
	});

	it('puts the soonest due first, an undated job last, each naming its product and opening its task', () => {
		const [administration] = groups;
		expect(administration.items.map(({ id, productName }) => [id, productName])).toEqual([
			['accounts', 'Meadow app'],
			['insurance', 'Harbour site']
		]);
		expect(administration.items[0].href).toBe('/projects/meadow/tasks/accounts');
	});

	it('lists every department’s jobs as one, the soonest due first, each keeping its department', () => {
		expect(teamWorkAcross(groups).map(({ id, department }) => [id, department])).toEqual([
			['pitch', departments.sales],
			['accounts', departments.administration],
			['insurance', departments.administration]
		]);
	});
});
