import { hasPasteKeys, pasteKeysHere } from './boxClipboard.js';

/** @typedef {import('./boxFiles.js').OpenBox} OpenBox */

const zoneStates = { open: 'open', over: 'over', pasting: 'pasting', closed: 'closed' };
const statesThatTakeFiles = [zoneStates.open, zoneStates.over, zoneStates.pasting];
const readyHint = 'Drop files here, or';
const noClipboardHere =
	'This box cannot read the clipboard here — open the upload page below and paste there.';
const notAnImageOrFile = 'What you pasted is not an image or a file.';

/** @param {string} id */
function part(id) {
	return /** @type {HTMLElement} */ (document.getElementById(id));
}

/**
 * @param {string} hint
 * @param {string} zoneState
 */
function showZone(hint, zoneState) {
	part('hint').textContent = hint;
	part('drop-zone').dataset.state = zoneState;
}

/** @param {OpenBox} box */
export function showOpenBox(box) {
	const footnote = part('footnote');
	part('task-title').textContent = box.taskTitle;
	/** @type {HTMLInputElement} */ (part('file-input')).disabled = false;
	/** @type {HTMLButtonElement} */ (part('paste-image')).disabled = false;
	footnote.textContent = `Each file goes straight onto the task, up to ${box.largestFile}.`;
	footnote.hidden = false;
	showReadyForFiles();
	showUploadPage(box.uploadPage);
}

export function showReadyForFiles() {
	showZone(readyHint, zoneStates.open);
}

/** @param {string} reason */
export function showClosedBox(reason) {
	showZone(reason, zoneStates.closed);
}

/**
 * The browser would not let the box read the clipboard itself, so the person's own paste does it:
 * the box already has focus from the press, and the paste keys reach it. A phone has no such keys.
 */
export function askForPasteKeys() {
	if (!hasPasteKeys()) {
		showZone(noClipboardHere, zoneStates.open);
		return;
	}
	showZone(`Now press ${pasteKeysHere()} to paste the image.`, zoneStates.pasting);
}

/** The clipboard was read and holds no image. A copied file is out of a button's sight, but not of the keys'. */
export function showNoImageOnClipboard() {
	const forCopiedFile = hasPasteKeys() ? ` For a copied file, press ${pasteKeysHere()}.` : '';
	showZone(`There is no image on the clipboard.${forCopiedFile}`, zoneStates.open);
}

export function showNothingUsablePasted() {
	showZone(notAnImageOrFile, zoneStates.open);
}

/**
 * The way round the box is on show from the moment its address is known: a host can leave the
 * box unable to take a file without the box ever finding out.
 * @param {string} address
 */
export function showUploadPage(address) {
	const link = part('upload-page');
	link.setAttribute('href', address);
	link.hidden = false;
}

/** @param {boolean} isOver */
export function markDraggedOver(isOver) {
	const zone = part('drop-zone');
	if (!statesThatTakeFiles.includes(zone.dataset.state ?? '')) return;
	zone.dataset.state = isOver ? zoneStates.over : zoneStates.open;
}
