import { postingRefusal } from '$lib/data/chat/chatRoomPosting';
import { validateChatFileFacts } from '$lib/data/chat/chatFileChecks';
import { signUploadLink } from '$lib/server/storage/signUploadLink';
import { readChatRooms } from './readChatRooms';
import { chatFileStoragePath, chatFilesBucket } from './chatFileBucket';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The link one file is sent to, and where it is kept once it has arrived, to be named on the message. */
export type GrantedChatFileUpload = { uploadUrl: string; storagePath: string };

/**
 * Opens a signed link for one file the sender is about to put on a message in the room, once the file as the browser
 * describes it fits the rules and the room is open; or says why not. Posting checks the file again as storage holds it.
 */
export async function grantChatFileUpload(
	serviceSupabase: SupabaseClient,
	sender: ChatRoomKeeper,
	roomId: string,
	input: Record<string, unknown>
): Promise<GrantedChatFileUpload | string> {
	const facts = validateChatFileFacts(input);
	if (typeof facts === 'string') return facts;
	const rooms = await readChatRooms(serviceSupabase, sender.organisationId);
	const refusal = postingRefusal(rooms.find((room) => room.id === roomId));
	if (refusal !== null) return refusal;
	const storagePath = chatFileStoragePath(sender, facts.fileName);
	const uploadUrl = await signUploadLink(serviceSupabase, chatFilesBucket, storagePath);
	return { uploadUrl, storagePath };
}
