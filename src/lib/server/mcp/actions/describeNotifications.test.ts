import { describe, expect, it } from 'vitest';
import { describeNotificationSubject } from './describeNotifications';
import type { NotificationListItem } from '$lib/server/notifications/notificationListItem';

const roomNotification: NotificationListItem = {
	id: 'n1',
	subjectKind: 'room',
	subjectId: 'finance',
	subjectTitle: 'Finance',
	projectId: '',
	organisationId: 'jewel',
	path: '/organisations/jewel/chat/finance',
	eventKind: null,
	messageBody: 'The VAT return is in.',
	messageAuthorId: 'nigel',
	isRead: false,
	createdAt: '2026-11-22T09:15:00Z'
};

describe('describeNotificationSubject', () => {
	it('points a chat room notification at the action that reads the room, and at its page', () => {
		expect(describeNotificationSubject(roomNotification)).toBe(
			'Read the chat room with read_chat_room, organisationId jewel and roomId finance; on the site it is at /organisations/jewel/chat/finance.'
		);
	});

	it('points a task notification at the action that reads the task', () => {
		const taskNotification = { ...roomNotification, subjectKind: 'task' as const, subjectId: 't1', organisationId: '', path: '/projects/p1/tasks/t1' };
		expect(describeNotificationSubject(taskNotification)).toBe('Read the task with read_task t1; on the site it is at /projects/p1/tasks/t1.');
	});
});
