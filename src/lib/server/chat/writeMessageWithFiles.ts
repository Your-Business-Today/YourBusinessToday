import { chatFileRefusals } from '$lib/data/chat/chatFileRules';
import { chatMessageOf, type ChatMessageRow } from './chatMessageRecord';
import { readFilesOfMessages } from './readChatMessageFiles';
import { uniqueViolation } from './chatRoomRecord';
import type { ChatFileArrived } from './checkSentChatFiles';
import type { ChatAuthor } from './postChatMessage';
import type { ChatMessage } from '$lib/data/chat/chatMessageRules';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

/** A message about to be written with its files: its words, which may be none, and each file as it arrived. */
export type MessageWithFiles = { body: string; files: ChatFileArrived[] };

const refusalSentences: string[] = [chatFileRefusals.wordsOrFiles, chatFileRefusals.tooManyFiles];

/** A refusal in the words of the rules: the function's own, or a file already on another message. */
function refusalOf(error: PostgrestError): string | null {
	if (error.code === uniqueViolation) return chatFileRefusals.alreadyOnAMessage;
	if (refusalSentences.includes(error.message)) return error.message;
	return null;
}

function refusedOrThrown(error: PostgrestError): string {
	const refusal = refusalOf(error);
	if (refusal !== null) return refusal;
	throw error;
}

function fileRowsOf(files: ChatFileArrived[]): Record<string, unknown>[] {
	return files.map((file) => ({ storage_path: file.storagePath, file_name: file.fileName, content_type: file.contentType, size_bytes: file.sizeBytes }));
}

/** Writes the message and a row for each of its files in one step, through post_chat_message_with_files, or says why not. */
export async function writeMessageWithFiles(serviceSupabase: SupabaseClient, author: ChatAuthor, roomId: string, message: MessageWithFiles): Promise<ChatMessage | string> {
	const { data, error } = await serviceSupabase.rpc('post_chat_message_with_files', {
		organisation: author.organisationId,
		room: roomId,
		author: author.accountId,
		words: message.body,
		via: author.postedVia,
		files: fileRowsOf(message.files)
	});
	if (error !== null) return refusedOrThrown(error);
	const written = chatMessageOf(data as ChatMessageRow);
	const filesByMessage = await readFilesOfMessages(serviceSupabase, [written.id]);
	return { ...written, files: filesByMessage.get(written.id) ?? [] };
}
