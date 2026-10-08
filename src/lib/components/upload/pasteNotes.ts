import { clipboardReadings, hasPasteKeys, pasteKeysHere } from '$lib/uploadBox/boxClipboard.js';

type ClipboardReading = { status: string; files: File[] };

export const notAnImageOrFile = 'What you pasted is not an image or a file.';

const noImageOnClipboard = 'There is no image on the clipboard.';
const readingRefused = 'Your browser would not let this page read the clipboard.';

/** What to tell someone whose press of the paste button brought no file — null when it brought one. */
export function pasteNoteFor(reading: ClipboardReading): string | null {
	const { status, files } = reading;
	if (files.length > 0) return null;
	const pasteKeys = hasPasteKeys() ? pasteKeysHere() : null;
	if (status === clipboardReadings.refused) return refusedNote(pasteKeys);
	return noImageNote(pasteKeys);
}

function refusedNote(pasteKeys: string | null): string {
	if (pasteKeys === null) return `${readingRefused} Choose the image instead.`;
	return `${readingRefused} Press ${pasteKeys} instead.`;
}

/** A copied file is out of a button's sight, but not of the paste keys'. */
function noImageNote(pasteKeys: string | null): string {
	if (pasteKeys === null) return noImageOnClipboard;
	return `${noImageOnClipboard} For a copied file, press ${pasteKeys}.`;
}
