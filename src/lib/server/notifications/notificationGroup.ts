import type { NotificationListItem } from './notificationListItem';

/** Every notification about one task, goal or room, told by its latest and counted. */
export type NotificationGroup = {
	latest: NotificationListItem;
	unreadCount: number;
	notificationCount: number;
};

function subjectKey(notification: NotificationListItem): string {
	return `${notification.subjectKind}:${notification.subjectId}`;
}

function countIn(group: NotificationGroup, notification: NotificationListItem): void {
	group.notificationCount += 1;
	if (!notification.isRead) group.unreadCount += 1;
}

/** The notifications, newest first, rolled up into one group per subject in the order of each subject's latest. */
export function groupNotificationsBySubject(notifications: NotificationListItem[]): NotificationGroup[] {
	const groupsBySubject = new Map<string, NotificationGroup>();
	for (const notification of notifications) {
		const key = subjectKey(notification);
		const group = groupsBySubject.get(key) ?? { latest: notification, unreadCount: 0, notificationCount: 0 };
		countIn(group, notification);
		groupsBySubject.set(key, group);
	}
	return [...groupsBySubject.values()];
}
