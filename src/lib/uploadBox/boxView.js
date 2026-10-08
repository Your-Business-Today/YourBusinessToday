import { outcomes } from './boxFiles.js';

/**
 * @typedef {import('./boxFiles.js').StepOutcome} StepOutcome
 * @typedef {import('./boxFiles.js').OpenBox} OpenBox
 */

const zoneStates = { open: 'open', over: 'over', closed: 'closed' };
const statesThatTakeFiles = [zoneStates.open, zoneStates.over];
const rowStates = { sending: 'sending', attached: 'attached', failed: 'failed' };
const couldNotSend = 'That file could not be sent from here.';

/** @param {string} id */
function part(id) {
	return /** @type {HTMLElement} */ (document.getElementById(id));
}

/** @param {OpenBox} box */
export function showOpenBox(box) {
	const footnote = part('footnote');
	part('task-title').textContent = box.taskTitle;
	part('hint').textContent = 'Drop files here, paste an image, or';
	part('drop-zone').dataset.state = zoneStates.open;
	/** @type {HTMLInputElement} */ (part('file-input')).disabled = false;
	footnote.textContent = `Each file goes straight onto the task, up to ${box.largestFile}.`;
	footnote.hidden = false;
	showUploadPage(box.uploadPage);
}

/** @param {string} reason */
export function showClosedBox(reason) {
	part('hint').textContent = reason;
	part('drop-zone').dataset.state = zoneStates.closed;
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

/**
 * @param {string} filename
 * @returns {HTMLElement}
 */
export function addFileRow(filename) {
	const row = document.createElement('li');
	const name = document.createElement('span');
	const status = document.createElement('span');
	row.className = 'file';
	row.dataset.state = rowStates.sending;
	name.className = 'file-name';
	name.textContent = filename;
	status.className = 'file-status';
	status.textContent = 'Sending…';
	row.append(name, status);
	part('files').append(row);
	return row;
}

/**
 * @param {HTMLElement} row
 * @param {StepOutcome} outcome
 */
export function showRowOutcome(row, outcome) {
	const status = /** @type {HTMLElement} */ (row.lastElementChild);
	if (outcome.outcome === outcomes.attached) {
		row.dataset.state = rowStates.attached;
		status.textContent = `On the task · ${outcome.size}`;
		return;
	}
	row.dataset.state = rowStates.failed;
	status.textContent = outcome.reason ?? couldNotSend;
}

/** @param {boolean} isOver */
export function markDraggedOver(isOver) {
	const zone = part('drop-zone');
	if (!statesThatTakeFiles.includes(zone.dataset.state ?? '')) return;
	zone.dataset.state = isOver ? zoneStates.over : zoneStates.open;
}
