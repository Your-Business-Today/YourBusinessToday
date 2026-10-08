import { outcomes, refusalBeforeSending, uploadDescriptionOf } from './boxFiles.js';
import { performStep, steps } from './boxSteps.js';

/**
 * @typedef {import('./boxFiles.js').StepOutcome} StepOutcome
 * @typedef {import('./boxFiles.js').OpenBox} OpenBox
 */

const bytesPerSlice = 32_768;
const tooBigForHere = {
	outcome: outcomes.needsUploadPage,
	reason: 'Too big to send from here — use the upload page below.'
};

let canReachStorage = true;

/**
 * Sends one file to the task: straight to storage where the host allows it, through the
 * connector when it is small enough, and otherwise says the upload page is the way.
 * @param {OpenBox} box
 * @param {File} file
 * @returns {Promise<StepOutcome>}
 */
export async function sendFile(box, file) {
	const refusal = refusalBeforeSending(box, file);
	if (refusal !== null) return refusal;
	const sentStraight = await sendStraightToStorage(box, file);
	if (sentStraight !== null) return sentStraight;
	if (file.size > box.largestRelayedFileBytes) return tooBigForHere;
	return sendThroughConnector(box, file);
}

/**
 * @param {OpenBox} box
 * @param {File} file
 * @returns {Promise<StepOutcome | null>} null when storage cannot be reached from here
 */
async function sendStraightToStorage(box, file) {
	if (!canReachStorage) return null;
	const upload = uploadDescriptionOf(file);
	const grant = await performStep(box.taskId, steps.grant, upload);
	if (grant.outcome !== outcomes.granted) return grant;
	const hasArrived = await putInStorage(grant.uploadUrl, file, upload.mimeType);
	if (!hasArrived) return null;
	return performStep(box.taskId, steps.record, { uploadId: grant.uploadId });
}

/**
 * A host that forbids the address makes the request fail outright, and is not asked again.
 * @param {string} uploadUrl
 * @param {File} file
 * @param {string} mimeType
 */
async function putInStorage(uploadUrl, file, mimeType) {
	try {
		const headers = { 'content-type': mimeType };
		const response = await fetch(uploadUrl, { method: 'PUT', headers, body: file });
		return response.ok;
	} catch {
		canReachStorage = false;
		return false;
	}
}

/**
 * @param {OpenBox} box
 * @param {File} file
 */
async function sendThroughConnector(box, file) {
	const contentBase64 = await base64Of(file);
	const fields = { ...uploadDescriptionOf(file), contentBase64 };
	return performStep(box.taskId, steps.attach, fields);
}

/**
 * The bytes go into text a slice at a time: a whole file handed over at once is more than a call may take.
 * @param {File} file
 */
async function base64Of(file) {
	const bytes = new Uint8Array(await file.arrayBuffer());
	let binaryText = '';
	for (let start = 0; start < bytes.length; start += bytesPerSlice) {
		binaryText += String.fromCharCode(...bytes.subarray(start, start + bytesPerSlice));
	}
	return btoa(binaryText);
}
