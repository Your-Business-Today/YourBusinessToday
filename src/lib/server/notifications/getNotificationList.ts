import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import {
	parseNotificationRow,
	type NotificationListItem
} from '$lib/server/notifications/notificationListItem';

const notificationPageSize = 50;
const columnsBeforeChat =
	'*, tasks(title, project_id), goals(title, project_id), task_comments(body, author_id), conversation_messages(body, author_account_id), project_events(kind, actor_account_id)';
export const notificationColumns = `${columnsBeforeChat}, chat_rooms(name, organisation_id), chat_messages(body, author_account_id)`;

function readLatestNotifications(supabase: SupabaseClient, recipientId: string, columns: string) {
	return supabase
		.from('notifications')
		.select(columns)
		.eq('recipient_id', recipientId)
		.order('created_at', { ascending: false })
		.limit(notificationPageSize)
		.returns<Record<string, unknown>[]>();
}

export async function getNotificationList(
	supabase: SupabaseClient,
	recipientId: string
): Promise<NotificationListItem[]> {
	const withChat = await readLatestNotifications(supabase, recipientId, notificationColumns);
	if (!withChat.error) return withChat.data.map(parseNotificationRow);
	if (!isSchemaNotYetMigrated(withChat.error)) throw withChat.error;
	const beforeChat = await readLatestNotifications(supabase, recipientId, columnsBeforeChat);
	if (beforeChat.error) throw beforeChat.error;
	return beforeChat.data.map(parseNotificationRow);
}
