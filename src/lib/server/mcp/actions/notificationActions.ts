import { describeNotificationList, describeNotificationSubject, noSuchNotification, nothingUnread } from './describeNotifications';
import { findNotificationFor } from '$lib/server/notifications/findNotificationFor';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getNotificationList } from '$lib/server/notifications/getNotificationList';
import { getUnreadNotificationCount } from '$lib/server/notifications/getUnreadNotificationCount';
import { markAllNotificationsRead } from '$lib/server/notifications/markAllNotificationsRead';
import { markNotificationRead } from '$lib/server/notifications/markNotificationRead';
import { objectSchema, readText, textField } from '../actionTypes';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const notificationActions: McpAction[] = [
	{
		name: 'list_notifications',
		area: 'account',
		audience: 'everyone',
		isWrite: false,
		summary: 'your notifications, newest first, as the bell lists them: who said what on which task or goal, and which are unread',
		guidance:
			'A notification is marked read with mark_notification_read, which says which action reads its conversation. ' +
			'The bell tells of posts on conversations you are in and of tasks you asked for being done; the fifty newest are listed.',
		inputSchema: objectSchema({ unreadOnly: { type: 'boolean', description: 'True to list only the unread ones' } }),
		run: async (caller, input) => listNotifications(caller, input.unreadOnly === true)
	},
	{
		name: 'mark_notification_read',
		area: 'account',
		audience: 'everyone',
		isWrite: true,
		summary: 'mark one notification read, as opening it on the site does, and learn where its conversation is',
		inputSchema: objectSchema({ notificationId: textField('The notification id, as list_notifications gives it') }, ['notificationId']),
		run: async (caller, input) => markOneRead(caller, readText(input, 'notificationId'))
	},
	{
		name: 'mark_all_notifications_read',
		area: 'account',
		audience: 'everyone',
		isWrite: true,
		summary: 'mark every notification of yours read',
		inputSchema: objectSchema({}),
		run: async (caller) => markEveryRead(caller)
	}
];

async function listNotifications(caller: McpCaller, isUnreadOnly: boolean): Promise<string> {
	const everyNotification = await getNotificationList(caller.supabase, caller.accountId);
	const notifications = isUnreadOnly ? everyNotification.filter((notification) => !notification.isRead) : everyNotification;
	if (isUnreadOnly && notifications.length === 0) return nothingUnread;
	const authorIds = notifications.flatMap((notification) => (notification.messageAuthorId === null ? [] : [notification.messageAuthorId]));
	const authors = await getAccountsById(caller.supabase, authorIds);
	return describeNotificationList(notifications, authors);
}

async function markOneRead(caller: McpCaller, notificationId: string): Promise<string> {
	const idRefusal = validateRecordId('notificationId', notificationId);
	if (idRefusal !== null) return idRefusal;
	const notification = await findNotificationFor(caller.supabase, caller.accountId, notificationId);
	if (notification === null) return noSuchNotification;
	await markNotificationRead(caller.supabase, notificationId);
	return `The notification is read. ${describeNotificationSubject(notification)}`;
}

async function markEveryRead(caller: McpCaller): Promise<string> {
	const unreadCount = await getUnreadNotificationCount(caller.supabase, caller.accountId);
	if (unreadCount === 0) return nothingUnread;
	await markAllNotificationsRead(caller.supabase, caller.accountId);
	return `${unreadCount} notification(s) marked read.`;
}
