import type { ChatMessageFile } from '$lib/data/chat/chatFileRules';

export const chatMessageFilesTable = 'chat_message_files';

export const chatMessageFileColumns = 'id, message_id, storage_path, file_name, content_type, size_bytes';

export type ChatMessageFileRow = {
	id: string;
	message_id: string;
	storage_path: string;
	file_name: string;
	content_type: string;
	size_bytes: number;
};

export function chatMessageFileOf(row: ChatMessageFileRow): ChatMessageFile {
	return { id: row.id, storagePath: row.storage_path, fileName: row.file_name, contentType: row.content_type, sizeBytes: Number(row.size_bytes) };
}
