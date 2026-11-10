import { readChatbotReach, type ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import { validateRecordId } from '$lib/data/isUuid';
import { readText, type McpAction } from './actionTypes';
import type { McpCaller } from './resolveMcpCaller';
import type { McpToolAnswer } from './mcpContent';

type ChatbotRun = (caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach) => Promise<McpToolAnswer>;

export type ChatbotActionDefinition = Omit<McpAction, 'run' | 'module' | 'isWrite'> & { run: ChatbotRun };

export const chatbotField = 'chatbotId';

export const notAChatbotYouUse =
	'You may not use a chatbot by that chatbotId. Call list_my_chatbots for the chatbots you may use.';

const gatedRuns = new WeakSet<McpAction['run']>();

/**
 * A reading through a chatbot, built so it cannot skip the chatbot's rule or write: it runs only for a
 * person the chatbot names now, by the email they sign in with, while its organisation has Your Business
 * Brain switched on, and it is never a write.
 */
export function chatbotAction(definition: ChatbotActionDefinition): McpAction {
	const run: McpAction['run'] = async (caller, input) => {
		const chatbotId = readText(input, chatbotField);
		const idRefusal = validateRecordId(chatbotField, chatbotId);
		if (idRefusal !== null) return idRefusal;
		const reach = await readChatbotReach(caller.supabase, chatbotId, caller.email);
		if (reach === null) return notAChatbotYouUse;
		return definition.run(caller, input, reach);
	};
	gatedRuns.add(run);
	return { ...definition, isWrite: false, run };
}

export function isGatedByChatbotRule(action: McpAction): boolean {
	return gatedRuns.has(action.run);
}
