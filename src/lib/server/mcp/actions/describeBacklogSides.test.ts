import { describe, expect, it } from 'vitest';
import { backlogSideLines } from './describeBacklogSides';
import { departments, type Department } from '$lib/data/department';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';
import type { InternalItemFacts } from './describeInternalItems';

const noFacts: InternalItemFacts = { people: [], assigneeIdsByTask: new Map(), todosByTask: {} };

function taskOn(id: string, department: Department, subtasks: TaskTreeNode[] = []): TaskTreeNode {
	return {
		id,
		title: `Task ${id}`,
		department,
		kind: 'work',
		status: 'backlog',
		storyPoints: 3,
		priority: 1,
		goalId: null,
		dueDate: null,
		stagedAt: null,
		liveAt: null,
		subtasks
	} as unknown as TaskTreeNode;
}

describe('the backlog read_project gives', () => {
	const backlog = [
		taskOn('insurance', departments.administration, [taskOn('quote', departments.administration)]),
		taskOn('website', departments.development),
		taskOn('secrets', departments.infrastructure)
	];
	const lines = backlogSideLines(backlog, [], noFacts);

	it('lists Development first, then Internal work, each task under its own side', () => {
		const internalHeading = lines.findIndex((line) => line.startsWith('Task Management —'));
		expect(lines[0]).toMatch(/^Development — /);
		expect(lines.slice(1, internalHeading).join('\n')).toMatch(/Task website[\s\S]*Task secrets/);
		expect(lines.slice(internalHeading).join('\n')).toMatch(/Task insurance[\s\S]*  Task quote/);
	});

	it('gives points to development work and none to internal work', () => {
		const website = lines.find((line) => line.startsWith('Task website'));
		const insurance = lines.find((line) => line.startsWith('Task insurance'));
		expect(website).toContain('3 points');
		expect(insurance).not.toContain('points');
	});

	it('says a side with nothing on it is empty', () => {
		const developmentOnly = backlogSideLines([taskOn('website', departments.development)], [], noFacts);
		expect(developmentOnly).toContain('Nothing here yet.');
	});
});
