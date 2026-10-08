import { askHost, listenToHost, onHostNotification, tellHost } from './hostChannel.js';
import { outcomes, refusedBecause, uploadPageIn } from './boxFiles.js';
import { performStep, steps } from './boxSteps.js';
import { sendFile } from './boxUploads.js';
import { addFileRow, showClosedBox, showOpenBox, showRowOutcome, showUploadPage } from './boxView.js';
import { applyHostLook } from './boxLook.js';
import { offerToTellClaude, whenFilesArrive, whenSizeChanges, whenUploadPageIsAsked } from './boxEvents.js';
import { noteFilesForClaude, openThroughHost, tellClaudeTheyAreIn } from './boxRequests.js';

/**
 * @typedef {import('./boxFiles.js').OpenBox} OpenBox
 * @typedef {import('./boxFiles.js').AttachedFile} AttachedFile
 */

const protocolVersion = '2026-01-26';
const boxInformation = { name: 'Your Business Today upload box', version: '1.0.0' };
const boxCapabilities = { availableDisplayModes: ['inline'] };
const couldNotOpen = 'This box could not open the task.';
const couldNotRead = refusedBecause('That file could not be read.');

/** @type {OpenBox | null} */
let openBox = null;
let hasBeenAskedToOpen = false;
let filesBeingSent = Promise.resolve();
/** @type {AttachedFile[]} */
const attachedFiles = [];

/** @param {{ arguments?: { taskId?: string } }} toolInput */
async function openOnTask({ arguments: toolArguments = {} }) {
	const { taskId = '' } = toolArguments;
	if (hasBeenAskedToOpen) return;
	hasBeenAskedToOpen = true;
	const opened = await performStep(taskId, steps.open);
	if (opened.outcome !== outcomes.opened) {
		showClosedBox(opened.reason ?? couldNotOpen);
		return;
	}
	const { taskTitle, uploadPage, largestFile, largestFileBytes, largestRelayedFileBytes } = opened;
	openBox = { taskId, taskTitle, uploadPage, largestFile, largestFileBytes, largestRelayedFileBytes };
	showOpenBox(openBox);
}

/**
 * Keeps the page Claude was given, for a box that cannot open the task itself.
 * @param {{ content?: { text?: string }[] }} toolResult
 */
function rememberUploadPage({ content = [] }) {
	const words = content.map((block) => block.text ?? '').join('\n');
	const address = uploadPageIn(words);
	if (address !== null && openBox === null) showUploadPage(address);
}

/** @param {File[]} files */
function takeFiles(files) {
	const box = openBox;
	if (box === null) return;
	for (const file of files) {
		const row = addFileRow(file.name);
		filesBeingSent = filesBeingSent.then(() => sendOne(box, file, row));
	}
}

/**
 * @param {OpenBox} box
 * @param {File} file
 * @param {HTMLElement} row
 */
async function sendOne(box, file, row) {
	const outcome = await sendFile(box, file).catch(() => couldNotRead);
	showRowOutcome(row, outcome);
	if (outcome.outcome !== outcomes.attached) return;
	attachedFiles.push({ filename: outcome.filename, size: outcome.size });
	noteFilesForClaude(box.taskTitle, attachedFiles);
	offerToTellClaude(() => tellClaudeTheyAreIn(attachedFiles));
}

async function startUploadBox() {
	listenToHost();
	onHostNotification('ui/notifications/tool-input', openOnTask);
	onHostNotification('ui/notifications/tool-result', rememberUploadPage);
	onHostNotification('ui/notifications/host-context-changed', applyHostLook);
	whenFilesArrive(takeFiles);
	whenUploadPageIsAsked(openThroughHost);
	const hostGreeting = { appInfo: boxInformation, appCapabilities: boxCapabilities, protocolVersion };
	const { hostContext = {} } = await askHost('ui/initialize', hostGreeting);
	applyHostLook(hostContext);
	tellHost('ui/notifications/initialized', {});
	whenSizeChanges((size) => tellHost('ui/notifications/size-changed', size));
}

startUploadBox();
