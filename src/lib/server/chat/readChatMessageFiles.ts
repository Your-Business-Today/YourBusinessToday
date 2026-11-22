import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { chatMessageFileColumns, chatMessageFileOf, chatMessageFilesTable, type ChatMessageFileRow } from './chatMessageFileRecord';
import type { ChatMessageFile } from '$lib/data/chat/chatFileRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The files the messages carry, by message, each message's in the order they were given. */
export type FilesByMessage = Map<string, ChatMessageFile[]>;

function groupedByMessage(rows: ChatMessageFileRow[]): FilesByMessage {
	const grouped: FilesByMessage = new Map();
	for (const row of rows) {
		const files = grouped.get(row.message_id) ?? [];
		files.push(chatMessageFileOf(row));
		grouped.set(row.message_id, files);
	}
	return grouped;
}

/**
 * The files the named messages carry, read as the reader reads them. The open room reads them every five seconds, so
 * they answer none while migration 0275 has not run rather than close the room.
 */
export async function readFilesOfMessages(supabase: SupabaseClient, messageIds: string[]): Promise<FilesByMessage> {
	if (messageIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from(chatMessageFilesTable)
		.select(chatMessageFileColumns)
		.in('message_id', messageIds)
		.order('created_at', { ascending: true });
	if (isSchemaNotYetMigrated(error)) return new Map();
	if (error !== null) throw error;
	return groupedByMessage(data as unknown as ChatMessageFileRow[]);
}
