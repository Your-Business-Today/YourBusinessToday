import { clipboardReadings, readClipboardImages } from './boxClipboard.js';
import { askForPasteKeys, showNoImageOnClipboard } from './boxView.js';

/**
 * Hands over the images on the clipboard when the paste button is pressed. Where the browser
 * will not let the box read the clipboard, the press still leaves the box with focus, so it
 * asks for the paste keys, and what they bring arrives the way any pasted file does.
 * @param {(files: File[]) => void} takeFiles
 */
export function whenPasteIsPressed(takeFiles) {
	const button = /** @type {HTMLButtonElement} */ (document.getElementById('paste-image'));
	button.addEventListener('click', async () => {
		const reading = await readClipboardImages(new Date());
		const { files } = reading;
		if (reading.status === clipboardReadings.refused) {
			askForPasteKeys();
			return;
		}
		if (files.length === 0) {
			showNoImageOnClipboard();
			return;
		}
		takeFiles(files);
	});
}
