/**
 * @typedef {{ outcome: string, reason?: string, [detail: string]: any }} StepOutcome
 * @typedef {{ filename: string, size: string }} AttachedFile
 * @typedef {{ taskId: string, taskTitle: string, uploadPage: string, largestFile: string,
 *   largestFileBytes: number, largestRelayedFileBytes: number }} OpenBox
 */

export const outcomes = {
	opened: 'opened',
	granted: 'granted',
	attached: 'attached',
	refused: 'refused',
	unreachable: 'unreachable',
	needsUploadPage: 'needsUploadPage'
};

const unknownMimeType = 'application/octet-stream';
const clipboardImageName = 'image.png';
const dateAndTimeLength = 19;
const uploadPagePattern = /https:\/\/[^\s/]+\/upload\/[\w.-]+/;

/**
 * @param {string} reason
 * @returns {StepOutcome}
 */
export function refusedBecause(reason) {
	return { outcome: outcomes.refused, reason };
}

/** @param {File} file */
export function uploadDescriptionOf(file) {
	const mimeType = file.type === '' ? unknownMimeType : file.type;
	return { filename: file.name, mimeType, byteCount: file.size };
}

/**
 * Why a file cannot be sent at all, before anything is tried.
 * @param {OpenBox} box
 * @param {File} file
 * @returns {StepOutcome | null}
 */
export function refusalBeforeSending(box, file) {
	if (file.size === 0) return refusedBecause('That file is empty.');
	if (file.size > box.largestFileBytes) {
		return refusedBecause(`Only a file up to ${box.largestFile} can go on a task.`);
	}
	return null;
}

/**
 * A screenshot pasted from the clipboard is called image.png every time, so it is named for when it was pasted.
 * @param {File} file
 * @param {Date} pastedAt
 */
export function renamedIfFromClipboard(file, pastedAt) {
	if (file.name !== clipboardImageName) return file;
	const dateAndTime = pastedAt.toISOString().slice(0, dateAndTimeLength);
	const timestamp = dateAndTime.replace('T', '-').replaceAll(':', '');
	return new File([file], `pasted-image-${timestamp}.png`, { type: file.type });
}

/**
 * The upload page's address, when the words Claude was given carry one.
 * @param {string} text
 * @returns {string | null}
 */
export function uploadPageIn(text) {
	const [address = null] = uploadPagePattern.exec(text) ?? [];
	return address;
}

/** @param {AttachedFile[]} attachedFiles */
export function namesOf(attachedFiles) {
	return attachedFiles.map((file) => `${file.filename} (${file.size})`).join(', ');
}

/**
 * What Claude is told has arrived, so it need not ask.
 * @param {string} taskTitle
 * @param {AttachedFile[]} attachedFiles
 */
export function attachedSummary(taskTitle, attachedFiles) {
	return (
		`Through the upload box the person has put these files on "${taskTitle}": ` +
		`${namesOf(attachedFiles)}. Call read_task to see them, and read_task_attachment to open one.`
	);
}
