import { chatFileRefusal } from '$lib/data/chat/chatFileChecks';
import { chatFileRefusals, fileNotArrivedRefusal, type ChatFileFacts } from '$lib/data/chat/chatFileRules';
import { inspectStoredFile } from '$lib/server/storage/inspectStoredFile';
import { chatFilesBucket, isSentBy } from './chatFileBucket';
import type { ChatFileSent } from '$lib/data/chat/validateChatMessage';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A file ready to go on a message: where it is kept, and its name, kind and size as storage holds it. */
export type ChatFileArrived = ChatFileFacts & { storagePath: string };

async function arrivedOrRefusal(serviceSupabase: SupabaseClient, sender: ChatRoomKeeper, file: ChatFileSent): Promise<ChatFileArrived | string> {
	const { storagePath, fileName } = file;
	if (!isSentBy(storagePath, sender, fileName)) return chatFileRefusals.notSentHere;
	const stored = await inspectStoredFile(serviceSupabase, chatFilesBucket, storagePath);
	if (stored === null) return fileNotArrivedRefusal(fileName);
	const arrived = { storagePath, fileName, ...stored };
	return chatFileRefusal(arrived) ?? arrived;
}

/**
 * Each file named on a message, measured where it arrived: sent by this sender to a link the site granted them, there
 * in storage, and of a size and kind the rules take as storage holds them, never as the browser said. The files as
 * they arrived, or the refusal of the first that does not fit.
 */
export async function checkSentChatFiles(serviceSupabase: SupabaseClient, sender: ChatRoomKeeper, files: ChatFileSent[]): Promise<ChatFileArrived[] | string> {
	const checked = await Promise.all(files.map((file) => arrivedOrRefusal(serviceSupabase, sender, file)));
	const refusal = checked.find((outcome) => typeof outcome === 'string');
	if (refusal !== undefined) return refusal;
	return checked as ChatFileArrived[];
}
