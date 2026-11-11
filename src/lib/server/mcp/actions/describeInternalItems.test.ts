import { describe, expect, it } from 'vitest';
import { internalItemLines, type InternalItemFacts } from './describeInternalItems';
import { departments } from '$lib/data/department';
import type { ProjectPerson } from '$lib/server/members/projectPersonRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
import type { Todo } from '$lib/server/todos/todoRecord';

const dana = { id: 'dana', name: 'Dana Wright', email: 'dana@example.com' } as ProjectPerson;
const insurance = {
	id: 'insurance',
	title: 'Put the insurance in place',
	department: departments.administration,
	status: 'on_hold',
	priority: 1,
	goalId: null,
	dueDate: '2026-11-20',
	subtasks: []
} as unknown as TaskTreeNode;
const quote = { id: 'quote', taskId: 'insurance', title: 'Get three quotes', status: 'doing', ownerAccountId: null, dueDate: null } as Todo;

const facts: InternalItemFacts = {
	people: [dana],
	assigneeIdsByTask: new Map([['insurance', ['dana']]]),
	todosByTask: { insurance: [quote] }
};

describe('an Internal work item as read_project gives it', () => {
	const [itemLine, todoLine] = internalItemLines(insurance, [], facts);

	it('says where it stands in monday.com’s words, whose it is and when it is due', () => {
		expect(itemLine).toContain('— Stuck, owner Dana Wright, due 20 Nov 2026');
		expect(itemLine).not.toContain('points');
	});

	it('lists its to-dos beneath it in the same words', () => {
		expect(todoLine).toBe('  - to-do: Get three quotes — Working on it, anyone on the project, no due date (to-do id: quote)');
	});

	it('says an item has no owner when nobody is on it', () => {
		const [unowned] = internalItemLines(insurance, [], { ...facts, assigneeIdsByTask: new Map() });
		expect(unowned).toContain('no owner');
	});
});
