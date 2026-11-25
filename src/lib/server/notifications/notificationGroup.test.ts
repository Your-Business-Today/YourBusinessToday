import { describe, expect, it } from 'vitest';
import { groupNotificationsBySubject } from './notificationGroup';
import type { NotificationListItem } from './notificationListItem';

function notificationOn(id: string, subjectId: string, isRead: boolean): NotificationListItem {
	return {
		id,
		subjectKind: 'task',
		subjectId,
		subjectTitle: `Task ${subjectId}`,
		projectId: 'p1',
		organisationId: '',
		path: `/projects/p1/tasks/${subjectId}`,
		eventKind: null,
		messageBody: `Message ${id}`,
		filesShared: '',
		messageAuthorId: 'jeremy',
		isRead,
		createdAt: '2026-11-25T17:00:00Z'
	};
}

describe('groupNotificationsBySubject', () => {
	const newestFirst = [
		notificationOn('n4', 'loan', false),
		notificationOn('n3', 'name', true),
		notificationOn('n2', 'loan', false),
		notificationOn('n1', 'loan', true)
	];
	const groups = groupNotificationsBySubject(newestFirst);

	it('gives one group per task, in the order of each task’s latest notification', () => {
		expect(groups.map((group) => group.latest.subjectId)).toEqual(['loan', 'name']);
	});

	it('tells each group by its latest notification', () => {
		expect(groups[0].latest.id).toBe('n4');
	});

	it('counts the unread notifications and all of them', () => {
		expect(groups[0].unreadCount).toBe(2);
		expect(groups[0].notificationCount).toBe(3);
		expect(groups[1].unreadCount).toBe(0);
	});

	it('keeps a goal apart from a task with the same id', () => {
		const goal = { ...notificationOn('n5', 'loan', false), subjectKind: 'goal' as const };
		expect(groupNotificationsBySubject([goal, ...newestFirst])).toHaveLength(3);
	});
});
