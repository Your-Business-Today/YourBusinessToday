import type { SupabaseClient } from '@supabase/supabase-js';
import { notificationColumns } from './getNotificationList';
import { parseNotificationRow, type NotificationListItem } from './notificationListItem';

/** One of the recipient's notifications, or null when no notification of theirs has that id. */
export async function findNotificationFor(
	supabase: SupabaseClient,
	recipientId: string,
	notificationId: string
): Promise<NotificationListItem | null> {
	const { data, error } = await supabase
		.from('notifications')
		.select(notificationColumns)
		.eq('recipient_id', recipientId)
		.eq('id', notificationId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseNotificationRow(data);
}
