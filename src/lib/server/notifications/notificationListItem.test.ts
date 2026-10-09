import { describe, expect, it } from 'vitest';
import { conversationPath, parseNotificationRow } from './notificationListItem';

const doneEvent = { kind: 'task_done', actor_account_id: null };

const said = {
	body: 'Jeremy — can you check the grid?',
	author_account_id: 'nigel'
};

describe('parseNotificationRow', () => {
	it('reads a message on a task as a task notification', () => {
		const item = parseNotificationRow({
			id: 'n1',
			task_id: 't1',
			goal_id: null,
			tasks: { title: 'Profit summary', project_id: 'p1' },
			goals: null,
			conversation_messages: said,
			is_read: false,
			created_at: '2026-09-22T11:36:55Z'
		});
		expect(item.subjectKind).toBe('task');
		expect(item.subjectId).toBe('t1');
		expect(item.subjectTitle).toBe('Profit summary');
		expect(item.projectId).toBe('p1');
		expect(item.messageAuthorId).toBe('nigel');
		expect(item.eventKind).toBeNull();
	});

	it('reads a task event as the event, with its actor in place of an author', () => {
		const item = parseNotificationRow({
			id: 'n3',
			task_id: 't1',
			goal_id: null,
			tasks: { title: 'Profit summary', project_id: 'p1' },
			goals: null,
			conversation_messages: null,
			project_events: doneEvent,
			is_read: false,
			created_at: '2026-10-09T14:32:00Z'
		});
		expect(item.eventKind).toBe('task_done');
		expect(item.messageAuthorId).toBeNull();
		expect(item.messageBody).toBe('');
	});

	it('reads a message on a goal as a goal notification', () => {
		const item = parseNotificationRow({
			id: 'n2',
			task_id: null,
			goal_id: 'g1',
			tasks: null,
			goals: { title: 'Grow to 1,000 players', project_id: 'p2' },
			conversation_messages: said,
			is_read: true,
			created_at: '2026-09-22T11:36:55Z'
		});
		expect(item.subjectKind).toBe('goal');
		expect(item.subjectId).toBe('g1');
		expect(item.subjectTitle).toBe('Grow to 1,000 players');
		expect(item.projectId).toBe('p2');
	});
});

describe('conversationPath', () => {
	it('opens the task or goal page on its project', () => {
		expect(conversationPath('task', 'p1', 't1')).toBe('/projects/p1/tasks/t1');
		expect(conversationPath('goal', 'p2', 'g1')).toBe('/projects/p2/goals/g1');
	});
});
