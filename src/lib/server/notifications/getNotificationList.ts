import type { SupabaseClient } from '@supabase/supabase-js';
import {
	parseNotificationRow,
	type NotificationListItem
} from '$lib/server/notifications/notificationListItem';

const notificationPageSize = 50;
const notificationColumns =
	'*, tasks(title, project_id), goals(title, project_id), task_comments(body, author_id), conversation_messages(body, author_account_id), project_events(kind, actor_account_id)';

export async function getNotificationList(
	supabase: SupabaseClient,
	recipientId: string
): Promise<NotificationListItem[]> {
	const { data, error } = await supabase
		.from('notifications')
		.select(notificationColumns)
		.eq('recipient_id', recipientId)
		.order('created_at', { ascending: false })
		.limit(notificationPageSize);
	if (error) throw error;
	return data.map(parseNotificationRow);
}
