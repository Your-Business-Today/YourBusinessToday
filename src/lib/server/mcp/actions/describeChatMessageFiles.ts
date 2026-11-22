import { describeFilesShared } from '$lib/data/chat/chatFilesShared';
import { describeByteCount } from '$lib/data/taskAttachmentRules';
import { fetchLinkLifetimeMinutes } from '$lib/server/storage/signFetchLink';
import type { ChatMessageFile } from '$lib/data/chat/chatFileRules';

/** The short-lived link each file of a reading is fetched through, by where the file is kept. */
export type ChatFileLinks = Map<string, string>;

const unsigned = 'no link could be made just now; read the room again for one';

function describeFile(file: ChatMessageFile, links: ChatFileLinks): string {
	const link = links.get(file.storagePath) ?? unsigned;
	return `  - ${file.fileName}, ${file.contentType}, ${describeByteCount(file.sizeBytes)}: ${link}`;
}

/** The lines telling of a message's files, each with its name, kind, size and a link to fetch it; none when it carries none. */
export function describeMessageFiles(files: ChatMessageFile[], links: ChatFileLinks): string[] {
	if (files.length === 0) return [];
	const shared = describeFilesShared(files.map((file) => file.contentType));
	const opening = `  Files: ${shared}. Fetch each within ${fetchLinkLifetimeMinutes} minutes, to look at it now; do not pass the links on:`;
	return [opening, ...files.map((file) => describeFile(file, links))];
}
