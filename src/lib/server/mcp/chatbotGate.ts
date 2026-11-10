import { readChatbotReach, type ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import { validateChatbotQuestionAsked } from '$lib/server/businessBrain/validateChatbotQuestion';
import { validateRecordId } from '$lib/data/isUuid';
import { readForQuestion, recordRefusedReading, type ChatbotReadingForQuestion } from './chatbotQuestionTrail';
import { readText, type McpAction } from './actionTypes';
import type { McpCaller } from './resolveMcpCaller';
import type { McpToolAnswer } from './mcpContent';

type ChatbotRun = (caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach) => Promise<McpToolAnswer>;

type ActionWithoutRun = Omit<McpAction, 'run' | 'module' | 'isWrite'>;

export type ChatbotActionDefinition = ActionWithoutRun & Pick<ChatbotReadingForQuestion, 'kind' | 'run'>;

export type ChatbotRecordDefinition = ActionWithoutRun & { run: ChatbotRun };

export const chatbotInputKey = 'chatbotId';

export const notAChatbotYouUse =
	'You may not use a chatbot by that chatbotId. Call list_my_chatbots for the chatbots you may use.';

const gatedRuns = new WeakSet<McpAction['run']>();

/**
 * A reading through a chatbot, built so it cannot skip the chatbot's rule, its record or write: it runs only for
 * a person the chatbot names now, by the email they sign in with, while its organisation has Your Business Brain
 * switched on, only for a question put on the chatbot's record first, and it is never a write. A reading the
 * rule refuses is kept on the record too.
 */
export function chatbotAction(definition: ChatbotActionDefinition): McpAction {
	const { kind, run: readThroughChatbot, ...action } = definition;
	const run: McpAction['run'] = async (caller, input) => {
		const chatbotId = readText(input, chatbotInputKey);
		const idRefusal = validateRecordId(chatbotInputKey, chatbotId);
		if (idRefusal !== null) return idRefusal;
		const asked = validateChatbotQuestionAsked(input);
		if (typeof asked === 'string') return asked;
		const reach = await readChatbotReach(caller.supabase, chatbotId, caller.email);
		if (reach !== null) return readForQuestion(caller, input, reach, { kind, asked, run: readThroughChatbot });
		await recordRefusedReading(caller, { chatbotId, kind, asked, refusal: notAChatbotYouUse });
		return notAChatbotYouUse;
	};
	gatedRuns.add(run);
	return { ...action, isWrite: false, run };
}

/** A write to a chatbot's record by a person it names now, built so it cannot skip the chatbot's rule. */
export function chatbotRecordAction(definition: ChatbotRecordDefinition): McpAction {
	const run: McpAction['run'] = async (caller, input) => {
		const chatbotId = readText(input, chatbotInputKey);
		const idRefusal = validateRecordId(chatbotInputKey, chatbotId);
		if (idRefusal !== null) return idRefusal;
		const reach = await readChatbotReach(caller.supabase, chatbotId, caller.email);
		if (reach === null) return notAChatbotYouUse;
		return definition.run(caller, input, reach);
	};
	gatedRuns.add(run);
	return { ...definition, isWrite: true, run };
}

export function isGatedByChatbotRule(action: McpAction): boolean {
	return gatedRuns.has(action.run);
}
