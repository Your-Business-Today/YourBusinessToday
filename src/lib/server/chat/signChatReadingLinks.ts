import { messagesIn } from '$lib/data/chat/chatRoomFlow';
import { signFetchLinks } from '$lib/server/storage/signFetchLink';
import { chatFilesBucket } from './chatFileBucket';
import type { ChatRoomReading } from './readChatRoomAsAsked';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * A short-lived link for every file the readings give, by where it is kept, signed in one call through the service
 * role, as a person's Claude is handed a project document's file to fetch.
 */
export async function signChatReadingLinks(serviceSupabase: SupabaseClient, readings: ChatRoomReading[]): Promise<Map<string, string>> {
	const messages = readings.flatMap((reading) => messagesIn(reading.entries));
	const storagePaths = messages.flatMap((message) => message.files.map((file) => file.storagePath));
	return signFetchLinks(serviceSupabase, chatFilesBucket, storagePaths);
}
