import { describe, expect, it } from 'vitest';
import { internalWorkGroups } from './internalWorkGroups';
import { departments, type Department } from '$lib/data/department';
import type { TaskStatus } from '$lib/data/taskStatus';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

function itemOn(id: string, department: Department, status: TaskStatus, subtasks: TaskTreeNode[] = []) {
	return { id, department, status, subtasks } as unknown as TaskTreeNode;
}

describe('the Internal work board', () => {
	const quote = itemOn('quote', departments.administration, 'done');
	const insurance = itemOn('insurance', departments.administration, 'in_progress', [quote]);
	const listing = itemOn('listing', departments.marketing, 'backlog');
	const groups = internalWorkGroups([insurance, listing]);

	it('has a group for each internal department, in order, even an empty one', () => {
		expect(groups.map((group) => group.label)).toEqual(['Administration', 'Sales', 'Marketing']);
		expect(groups[1].items).toEqual([]);
	});

	it('puts each subtask straight after its item, a level further in', () => {
		const rows = groups[0].items.map((item) => [item.id, item.depth]);
		expect(rows).toEqual([
			['insurance', 0],
			['quote', 1]
		]);
	});

	it('numbers each item among the items shown beside it, not among every task in the project', () => {
		const leads = itemOn('leads', departments.administration, 'backlog');
		const [administration] = internalWorkGroups([insurance, listing, leads]);
		const places = administration.items.map(({ id, place }) => [id, place.position, place.count]);
		expect(places).toEqual([
			['insurance', 1, 2],
			['quote', 1, 1],
			['leads', 2, 2]
		]);
		const [{ place: firstPlace }] = administration.items;
		expect(firstPlace.shownIds).toBe('insurance,leads');
	});

	it('counts only the open items', () => {
		expect(groups[0].openItemCount).toBe(1);
		expect(groups[2].openItemCount).toBe(1);
	});
});
