import { pastedImageName } from './boxFiles.js';

/**
 * @typedef {{ status: string, files: File[] }} ClipboardReading
 */

export const clipboardReadings = { read: 'read', refused: 'refused' };

const imageKind = 'image/';
const refused = { status: clipboardReadings.refused, files: [] };

/**
 * The images on the clipboard, as files named for when they were pasted. A browser lets a page read
 * the clipboard only if the person agrees, and a page embedded in another only if that one grants
 * it as well — so the reading can be refused, and then the paste keys are the way in.
 * @param {Date} pastedAt
 * @returns {Promise<ClipboardReading>}
 */
export async function readClipboardImages(pastedAt) {
	try {
		const { clipboard } = navigator;
		const items = await clipboard.read();
		const images = await Promise.all(items.map((item) => imageIn(item, pastedAt)));
		return { status: clipboardReadings.read, files: images.filter((image) => image !== null) };
	} catch {
		return refused;
	}
}

/**
 * @param {ClipboardItem} item
 * @param {Date} pastedAt
 * @returns {Promise<File | null>}
 */
async function imageIn(item, pastedAt) {
	const { types } = item;
	const type = types.find((candidate) => candidate.startsWith(imageKind));
	if (type === undefined) return null;
	const image = await item.getType(type);
	return new File([image], pastedImageName(pastedAt, extensionFor(type)), { type });
}

/**
 * The ending a file of that type carries: png for image/png, svg for image/svg+xml.
 * @param {string} type
 */
function extensionFor(type) {
	const subtype = type.slice(imageKind.length);
	const [extension] = subtype.split('+');
	return extension;
}

/** The keys that paste on this machine, as the person would read them on their keyboard. */
export function pasteKeysHere() {
	const { userAgent } = navigator;
	return userAgent.includes('Mac') ? '⌘V' : 'Ctrl+V';
}

/** Whether this device is likely to have paste keys at all: a phone or a tablet on its own has none. */
export function hasPasteKeys() {
	const finePointer = window.matchMedia('(any-pointer: fine)');
	return finePointer.matches;
}
