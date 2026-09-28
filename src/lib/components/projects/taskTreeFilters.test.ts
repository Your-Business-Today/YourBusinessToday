import { describe, expect, it } from 'vitest';
import { withoutDoneTasks } from './taskTreeFilters';
import type { TaskStatus } from '$lib/data/taskStatus';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

function task(id: string, status: TaskStatus, subtasks: TaskTreeNode[] = []): TaskTreeNode {
	return { id, status, subtasks } as unknown as TaskTreeNode;
}

const idsOf = (tasks: TaskTreeNode[]) => tasks.map((candidate) => candidate.id);

describe('withoutDoneTasks', () => {
	it('leaves out done tasks and keeps the open ones in order', () => {
		const tree = [task('one', 'backlog'), task('two', 'done'), task('three', 'in_progress')];
		expect(idsOf(withoutDoneTasks(tree))).toEqual(['one', 'three']);
	});

	it('raises the open subtasks of a done parent into its place', () => {
		const doneParent = task('parent', 'done', [task('open-child', 'backlog'), task('done-child', 'done')]);
		const tree = [task('before', 'backlog'), doneParent, task('after', 'backlog')];
		expect(idsOf(withoutDoneTasks(tree))).toEqual(['before', 'open-child', 'after']);
	});

	it('keeps an open parent with only its open subtasks beneath it', () => {
		const tree = [task('parent', 'backlog', [task('open-child', 'backlog'), task('done-child', 'done')])];
		const [parent] = withoutDoneTasks(tree);
		expect(idsOf(parent.subtasks)).toEqual(['open-child']);
	});
});
