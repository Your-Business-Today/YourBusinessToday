import { describe, expect, it } from 'vitest';
import { describeNotificationList, describeNotificationSubject } from './describeNotifications';
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
	filesShared: '',
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

describe('describeNotificationList', () => {
	const nigel = { id: 'nigel', email: 'nigel@example.com', name: 'Nigel Smith' };

	it('tells of a message of photos alone by what was sent, never by an empty quote', () => {
		const photosAlone = { ...roomNotification, messageBody: '', filesShared: 'sent 2 photos' };
		const line = describeNotificationList([photosAlone], [nigel]);
		expect(line).toContain('Nigel Smith said in the room Finance — sent 2 photos — notification n1');
		expect(line).not.toContain('""');
	});

	it('quotes the words, then names the files, when a message has both', () => {
		const both = { ...roomNotification, filesShared: 'sent a file' };
		expect(describeNotificationList([both], [nigel])).toContain('"The VAT return is in." — sent a file');
	});
});
