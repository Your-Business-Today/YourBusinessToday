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
const columnsWithChatFiles = `${columnsBeforeChat}, chat_rooms(name, organisation_id), chat_messages(body, author_account_id, chat_message_files(content_type))`;

/** The columns the bell reads, newest schema first: each is tried while the migration it needs (0272, 0275) has not run. */
const columnsByMigration = [columnsWithChatFiles, notificationColumns, columnsBeforeChat];

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
	for (const columns of columnsByMigration) {
		const latest = await readLatestNotifications(supabase, recipientId, columns);
		if (!latest.error) return latest.data.map(parseNotificationRow);
		if (!isSchemaNotYetMigrated(latest.error)) throw latest.error;
	}
	return [];
}
