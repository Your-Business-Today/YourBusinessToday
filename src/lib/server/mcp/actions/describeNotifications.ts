import { accountNameLookup } from '$lib/data/accountNames';
import { conversationPath, type NotificationListItem } from '$lib/server/notifications/notificationListItem';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { notificationSentence } from '$lib/data/notificationSentence';
import { shortenedToFit } from '$lib/data/textFit';
import type { Account } from '$lib/server/accounts/accountRecord';

export const noNotificationsYet =
	"Nothing yet — you'll be told when someone posts on a task or goal whose conversation you are in, and when a task you asked for is done.";
export const nothingUnread = 'Nothing is unread.';
export const noSuchNotification = 'No notification of yours has that id. Call list_notifications to see them.';

const longestBodyShown = 160;
const unreadMark = 'unread';
const readMark = 'read';

/** The notifications as the bell's page lists them, newest first, with the id to mark each read by and the subject to read. */
export function describeNotificationList(notifications: NotificationListItem[], authors: Account[]): string {
	if (notifications.length === 0) return noNotificationsYet;
	const nameOf = accountNameLookup(authors);
	return notifications.map((notification) => describeNotificationLine(notification, nameOf)).join('\n');
}

/** Where to go after a notification is read: the action that reads its conversation and the page that shows it. */
export function describeNotificationSubject(notification: NotificationListItem): string {
	const { subjectKind, subjectId, projectId } = notification;
	return `Read the ${subjectKind} with read_${subjectKind} ${subjectId}; on the site it is at ${conversationPath(subjectKind, projectId, subjectId)}.`;
}

function describeNotificationLine(notification: NotificationListItem, nameOf: (accountId: string) => string): string {
	const { messageAuthorId, messageBody, isRead, createdAt, id, subjectKind, subjectId } = notification;
	const actorName = messageAuthorId === null ? null : nameOf(messageAuthorId);
	const sentence = notificationSentence({ ...notification, actorName });
	const telling = `${sentence.who}${sentence.what}${sentence.which}`;
	const said = messageBody === '' ? null : `"${shortenedToFit(firstLineOf(messageBody), longestBodyShown)}"`;
	const parts = [isRead ? readMark : unreadMark, formatBritishDateTime(createdAt), telling, said, `notification ${id}`, `${subjectKind} ${subjectId}`];
	return parts.filter((part) => part !== null).join(' — ');
}

function firstLineOf(body: string): string {
	const [firstLine] = body.split('\n');
	return firstLine.trim();
}
