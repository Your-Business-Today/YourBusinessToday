import { askHost } from './hostChannel.js';
import { attachedSummary, namesOf } from './boxFiles.js';

/** @typedef {import('./boxFiles.js').AttachedFile} AttachedFile */

const textKind = 'text';

/**
 * Asks the host to do something on the box's behalf, and says whether it did.
 * @param {string} method
 * @param {Record<string, unknown>} params
 */
async function hostDoes(method, params) {
	try {
		const answer = await askHost(method, params);
		return answer.isError !== true;
	} catch {
		return false;
	}
}

/**
 * Lets Claude know what has arrived, for its next turn, without a word from the person.
 * @param {string} taskTitle
 * @param {AttachedFile[]} attachedFiles
 */
export function noteFilesForClaude(taskTitle, attachedFiles) {
	const summary = [{ type: textKind, text: attachedSummary(taskTitle, attachedFiles) }];
	return hostDoes('ui/update-model-context', { content: summary });
}

/**
 * Says in the conversation, as the person, that the files are in.
 * @param {AttachedFile[]} attachedFiles
 */
export function tellClaudeTheyAreIn(attachedFiles) {
	const words = `I have added ${namesOf(attachedFiles)} to the task through the upload box.`;
	return hostDoes('ui/message', { role: 'user', content: [{ type: textKind, text: words }] });
}

/**
 * Has the host open an address, which a sandboxed page cannot do by itself.
 * @param {string} url
 */
export function openThroughHost(url) {
	return hostDoes('ui/open-link', { url });
}
