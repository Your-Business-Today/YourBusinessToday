import { outcomes } from './boxFiles.js';

/** @typedef {import('./boxFiles.js').StepOutcome} StepOutcome */

const rowStates = { sending: 'sending', attached: 'attached', failed: 'failed' };
const couldNotSend = 'That file could not be sent from here.';

/**
 * @param {string} filename
 * @returns {HTMLElement}
 */
export function addFileRow(filename) {
	const list = /** @type {HTMLElement} */ (document.getElementById('files'));
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
	list.append(row);
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
