import { beforeEach, describe, expect, it, vi } from 'vitest';
import { noNotificationsYet, noSuchNotification, nothingUnread } from './describeNotifications';
import { notificationActions } from './notificationActions';
import type { McpCaller } from '../resolveMcpCaller';

const jamesId = '11111111-1111-4111-8111-111111111111';
const saidId = '22222222-2222-4222-8222-222222222222';
const doneId = '33333333-3333-4333-8333-333333333333';
const strangersId = '44444444-4444-4444-8444-444444444444';
const projectId = '55555555-5555-4555-8555-555555555555';
const taskId = '66666666-6666-4666-8666-666666666666';
const staff = { accountId: 'staff-1', supabase: {} } as unknown as McpCaller;

const { bell, oneMarked, everyMarked, unreadCounted } = vi.hoisted(() => ({
	bell: { notifications: [] as unknown[] },
	oneMarked: vi.fn(),
	everyMarked: vi.fn(),
	unreadCounted: vi.fn()
}));

vi.mock('$lib/server/notifications/getNotificationList', () => ({ getNotificationList: async () => bell.notifications }));
vi.mock('$lib/server/notifications/findNotificationFor', () => ({
	findNotificationFor: async (_supabase: unknown, _recipientId: string, notificationId: string) =>
		bell.notifications.find((notification) => (notification as { id: string }).id === notificationId) ?? null
}));
vi.mock('$lib/server/accounts/getAccountsById', () => ({ getAccountsById: async () => [{ id: jamesId, name: 'James', email: 'james@example.com' }] }));
vi.mock('$lib/server/notifications/markNotificationRead', () => ({ markNotificationRead: oneMarked }));
vi.mock('$lib/server/notifications/markAllNotificationsRead', () => ({ markAllNotificationsRead: everyMarked }));
vi.mock('$lib/server/notifications/getUnreadNotificationCount', () => ({ getUnreadNotificationCount: unreadCounted }));

const onTheTask = { subjectKind: 'task', subjectId: taskId, subjectTitle: 'Fix the invoice total', projectId };
const jamesSaid = { ...onTheTask, id: saidId, eventKind: null, messageBody: 'Can you check the rounding?\nIt is out by a penny.', messageAuthorId: jamesId, isRead: false, createdAt: '2026-11-12T19:40:00Z' };
const taskDone = { ...onTheTask, id: doneId, eventKind: 'task_done', messageBody: '', messageAuthorId: null, isRead: true, createdAt: '2026-11-11T09:05:00Z' };

function run(name: string, input: Record<string, unknown>) {
	const action = notificationActions.find((candidate) => candidate.name === name);
	if (action === undefined) throw new Error(`No action named ${name}`);
	return action.run(staff, input);
}

describe('the bell through the connector', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		bell.notifications = [jamesSaid, taskDone];
	});

	it('lists the notifications as the page does, newest first, with who said what and where', async () => {
		expect(await run('list_notifications', {})).toBe(
			[
				`unread — 12 Nov, 19:40 — James said on the task Fix the invoice total — "Can you check the rounding?" — notification ${saidId} — task ${taskId}`,
				`read — 11 Nov, 09:05 — A merged pull request finished the task you asked for, Fix the invoice total — notification ${doneId} — task ${taskId}`
			].join('\n')
		);
	});

	it('lists only the unread ones when asked, and says when there is nothing', async () => {
		expect(await run('list_notifications', { unreadOnly: true })).toContain(`notification ${saidId}`);
		expect(await run('list_notifications', { unreadOnly: true })).not.toContain(`notification ${doneId}`);
		bell.notifications = [taskDone];
		expect(await run('list_notifications', { unreadOnly: true })).toBe(nothingUnread);
		bell.notifications = [];
		expect(await run('list_notifications', {})).toBe(noNotificationsYet);
	});

	it('marks one notification read and says where its conversation is', async () => {
		expect(await run('mark_notification_read', { notificationId: saidId })).toBe(
			`The notification is read. Read the task with read_task ${taskId}; on the site it is at /projects/${projectId}/tasks/${taskId}.`
		);
		expect(oneMarked).toHaveBeenCalledWith(staff.supabase, saidId);
	});

	it("marks nothing that is not the caller's own", async () => {
		expect(await run('mark_notification_read', { notificationId: strangersId })).toBe(noSuchNotification);
		expect(await run('mark_notification_read', { notificationId: 'bell' })).toContain('The notificationId must be an id');
		expect(oneMarked).not.toHaveBeenCalled();
	});

	it('marks every notification read and counts them, or says nothing was unread', async () => {
		unreadCounted.mockResolvedValue(3);
		expect(await run('mark_all_notifications_read', {})).toBe('3 notification(s) marked read.');
		expect(everyMarked).toHaveBeenCalledWith(staff.supabase, 'staff-1');
		unreadCounted.mockResolvedValue(0);
		expect(await run('mark_all_notifications_read', {})).toBe(nothingUnread);
		expect(everyMarked).toHaveBeenCalledTimes(1);
	});
});
