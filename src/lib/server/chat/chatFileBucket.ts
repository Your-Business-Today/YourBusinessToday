import { isUuid } from '$lib/data/isUuid';
import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';
import type { ChatRoomKeeper } from './chatRoomRecord';

/** The private bucket the files said in the chat are kept in (migration 0275). */
export const chatFilesBucket = 'chat-files';

const pathSeparator = '/';

/** Where a file sent for a message is kept: under its organisation and its sender, then the upload's own id, so the path itself says who may put it on a message. */
export function chatFileStoragePath(sender: ChatRoomKeeper, fileName: string): string {
	return [sender.organisationId, sender.accountId, crypto.randomUUID(), safeStorageFilename(fileName)].join(pathSeparator);
}

/** Whether the path is one the site granted this sender for a file of that name, and no one else's. */
export function isSentBy(storagePath: string, sender: ChatRoomKeeper, fileName: string): boolean {
	const [organisationId, accountId, uploadId, storedName, ...beyond] = storagePath.split(pathSeparator);
	const isTheirFolder = organisationId === sender.organisationId && accountId === sender.accountId;
	const isTheFileNamed = storedName === safeStorageFilename(fileName);
	return isTheirFolder && isUuid(uploadId ?? '') && isTheFileNamed && beyond.length === 0;
}
