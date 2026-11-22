import { chatPictureTypes, chatPicturesShownInRoom } from './chatFileRules';

const pictureTypes: readonly string[] = chatPictureTypes;
const one = 1;
const none = 0;

/** Whether the room draws the file under the words, rather than linking to it by name. */
export function isPictureShownInRoom(contentType: string): boolean {
	return chatPicturesShownInRoom.includes(contentType);
}

function counted(count: number, singular: string, plural: string): string | null {
	if (count === none) return null;
	if (count === one) return `a ${singular}`;
	return `${count} ${plural}`;
}

/**
 * What a message's files are, in the words a notification or a reading gives when the message has no words of its
 * own: "sent 2 photos", "sent a file", "sent a photo and 2 files". Empty when it carries none.
 */
export function describeFilesShared(contentTypes: string[]): string {
	const pictureCount = contentTypes.filter((contentType) => pictureTypes.includes(contentType)).length;
	const photos = counted(pictureCount, 'photo', 'photos');
	const files = counted(contentTypes.length - pictureCount, 'file', 'files');
	const named = [photos, files].filter((part) => part !== null);
	if (named.length === none) return '';
	return `sent ${named.join(' and ')}`;
}
