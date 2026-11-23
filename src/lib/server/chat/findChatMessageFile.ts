import { isPictureShownInRoom } from '$lib/data/chat/chatFilesShared';
import { signFetchLink, signShowLink } from '$lib/server/storage/signFetchLink';
import { chatFilesBucket } from './chatFileBucket';
import { chatMessageFileColumns, chatMessageFileOf, chatMessageFilesTable, type ChatMessageFileRow } from './chatMessageFileRecord';
import type { ChatMessageFile } from '$lib/data/chat/chatFileRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** One file said in the organisation's chat, read as the reader reads it, or null when they cannot see one of that id. */
export async function findChatMessageFile(supabase: SupabaseClient, organisationId: string, fileId: string): Promise<ChatMessageFile | null> {
	const { data, error } = await supabase
		.from(chatMessageFilesTable)
		.select(chatMessageFileColumns)
		.eq('organisation_id', organisationId)
		.eq('id', fileId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return chatMessageFileOf(data as unknown as ChatMessageFileRow);
}

/**
 * A short-lived signed link to the file: a picture the room draws opens in the browser at full size, any other file
 * downloads under its own name. The bucket has no policy, so it is signed through the service role once the reader
 * has been let in.
 */
export async function signChatFileLink(serviceSupabase: SupabaseClient, file: ChatMessageFile): Promise<string> {
	if (isPictureShownInRoom(file.contentType)) return signShowLink(serviceSupabase, chatFilesBucket, file.storagePath);
	return signFetchLink(serviceSupabase, chatFilesBucket, { storagePath: file.storagePath, filename: file.fileName });
}
