import { describe, expect, it } from 'vitest';
import { countTasksInTree } from './taskTreeCounts';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

const task = (id: string, subtasks: TaskTreeNode[] = []): TaskTreeNode =>
	({ id, subtasks }) as TaskTreeNode;

describe('counting a task tree', () => {
	it('counts nothing when there are no tasks', () => {
		expect(countTasksInTree([])).toBe(0);
	});

	it('counts a task and every subtask beneath it', () => {
		const tree = [task('parent', [task('child', [task('grandchild')])]), task('sibling')];
		expect(countTasksInTree(tree)).toBe(4);
	});
});
