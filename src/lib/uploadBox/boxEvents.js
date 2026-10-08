import { markDraggedOver } from './boxView.js';
import { renamedIfFromClipboard } from './boxFiles.js';

/**
 * Hands over every file the person gives the box: chosen, dropped anywhere on it, or pasted.
 * @param {(files: File[]) => void} takeFiles
 */
export function whenFilesArrive(takeFiles) {
	const fileInput = /** @type {HTMLInputElement} */ (document.getElementById('file-input'));
	fileInput.addEventListener('change', () => {
		takeFiles([...(fileInput.files ?? [])]);
		fileInput.value = '';
	});
	document.addEventListener('dragover', (event) => {
		event.preventDefault();
		markDraggedOver(true);
	});
	document.addEventListener('dragleave', (event) => {
		const hasLeftTheBox = event.relatedTarget === null;
		if (hasLeftTheBox) markDraggedOver(false);
	});
	document.addEventListener('drop', (event) => {
		event.preventDefault();
		markDraggedOver(false);
		takeFiles(filesIn(event.dataTransfer));
	});
	document.addEventListener('paste', (event) => {
		const pastedAt = new Date();
		const pastedFiles = filesIn(event.clipboardData);
		takeFiles(pastedFiles.map((file) => renamedIfFromClipboard(file, pastedAt)));
	});
}

/** @param {DataTransfer | null} transfer */
function filesIn(transfer) {
	return [...(transfer?.files ?? [])];
}

/**
 * Keeps the host's frame as tall as the box, so nothing scrolls inside it.
 * @param {(size: { width: number, height: number }) => void} reportSize
 */
export function whenSizeChanges(reportSize) {
	let reportedHeight = 0;
	const measure = () => {
		const box = document.documentElement.getBoundingClientRect();
		const height = Math.ceil(box.height);
		const hasNothingNewToReport = box.width === 0 || height === reportedHeight;
		if (hasNothingNewToReport) return;
		reportedHeight = height;
		reportSize({ width: Math.ceil(window.innerWidth), height });
	};
	new ResizeObserver(measure).observe(document.body);
	measure();
}

/**
 * Offers one press that tells Claude the files are in, and says so plainly when the host
 * will not pass the word on, so the person knows to say it themselves.
 * @param {() => Promise<boolean>} tellClaude
 */
export function offerToTellClaude(tellClaude) {
	const button = /** @type {HTMLButtonElement} */ (document.getElementById('tell-claude'));
	button.textContent = 'Tell Claude they are in';
	button.disabled = false;
	button.hidden = false;
	button.onclick = async () => {
		button.disabled = true;
		const hasBeenTold = await tellClaude();
		button.textContent = hasBeenTold ? 'Claude has been told' : 'Now tell Claude in a message';
	};
}

/**
 * Opens the upload page through the host, and spells the address out to be copied when the
 * host will not open it.
 * @param {(address: string) => Promise<boolean>} openThroughHost
 */
export function whenUploadPageIsAsked(openThroughHost) {
	const link = /** @type {HTMLAnchorElement} */ (document.getElementById('upload-page'));
	link.addEventListener('click', async (event) => {
		event.preventDefault();
		const address = link.getAttribute('href') ?? '';
		const hasOpened = await openThroughHost(address);
		if (!hasOpened) link.textContent = address;
	});
}
