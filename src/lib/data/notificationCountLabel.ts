const single = 1;

function plural(count: number, noun: string): string {
	return count === single ? `${count} ${noun}` : `${count} ${noun}s`;
}

/** How many notifications a rolled-up row holds: the unread ones while any are, else all of them when more than one. */
export function notificationCountLabel(unreadCount: number, notificationCount: number): string {
	if (unreadCount > 0) return `${plural(unreadCount, 'unread message')}`;
	if (notificationCount > single) return plural(notificationCount, 'message');
	return '';
}
