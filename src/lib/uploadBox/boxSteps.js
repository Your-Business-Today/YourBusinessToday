import { askHost } from './hostChannel.js';
import { outcomes } from './boxFiles.js';

/** @typedef {import('./boxFiles.js').StepOutcome} StepOutcome */

const stepToolName = 'perform_upload_box_step';

export const steps = { open: 'open', grant: 'grant', record: 'record', attach: 'attach' };

const unreachable = {
	outcome: outcomes.unreachable,
	reason: 'Your Business Today could not be reached from this box.'
};

/**
 * Runs one step of the box's own tool, through the host, and reads what came of it.
 * @param {string} taskId
 * @param {string} step
 * @param {Record<string, unknown>} [fields]
 * @returns {Promise<StepOutcome>}
 */
export async function performStep(taskId, step, fields = {}) {
	const toolCall = { name: stepToolName, arguments: { taskId, step, ...fields } };
	try {
		return outcomeIn(await askHost('tools/call', toolCall));
	} catch {
		return unreachable;
	}
}

/**
 * The outcome travels as structured content, and as its own text for a host that drops that.
 * @param {{ isError?: boolean, structuredContent?: StepOutcome, content?: { text?: string }[] }} toolResult
 * @returns {StepOutcome}
 */
function outcomeIn(toolResult) {
	if (toolResult.isError === true) return unreachable;
	if (toolResult.structuredContent !== undefined) return toolResult.structuredContent;
	const [firstBlock = {}] = toolResult.content ?? [];
	if (firstBlock.text === undefined) return unreachable;
	return JSON.parse(firstBlock.text);
}
