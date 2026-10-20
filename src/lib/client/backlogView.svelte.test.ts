import { describe, expect, it } from 'vitest';
import { BacklogView } from './backlogView.svelte';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

function task(id: string, subtasks: TaskTreeNode[] = []): TaskTreeNode {
	return { id, status: 'backlog', subtasks } as unknown as TaskTreeNode;
}

const jeremy = 'jeremy';
const james = 'james';
const taskTree = [task('receipt-photos', [task('anthropic-key')]), task('walkthroughs')];
const assigneeIdsByTask = {
	'receipt-photos': [james],
	'anthropic-key': [jeremy],
	walkthroughs: [jeremy]
};

function backlogFor(): BacklogView {
	return new BacklogView({
		taskTree: () => taskTree,
		assigneeIdsByTask: () => assigneeIdsByTask,
		isWaitingOnMe: () => false
	});
}

describe('BacklogView.countOf', () => {
	it('counts every shown task when nothing narrows the list', () => {
		const backlog = backlogFor();
		expect(backlog.countOf(backlog.visibleTasks)).toBe(3);
	});

	it('leaves out a parent shown only to hold a matching subtask', () => {
		const backlog = backlogFor();
		backlog.toggleAssignee(jeremy);
		expect(backlog.visibleTasks).toHaveLength(2);
		expect(backlog.countOf(backlog.visibleTasks)).toBe(backlog.assignedCountFor(jeremy));
	});
});
