import { readBrainIndexOfParts } from '$lib/server/businessBrain/readBusinessBrainIndex';
import { readChatbotsForPerson, type ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import { searchBusinessBrainParts } from '$lib/server/businessBrain/searchBusinessBrain';
import { validateBusinessBrainPart, validateBusinessBrainSearch } from '$lib/server/businessBrain/validateBusinessBrainReading';
import { describeBusinessBrainIndex, describeBusinessBrainSearch } from './businessBrainListings';
import { chatbotSearchNotReadyYet, describeChatbotsToUse, partOutsideChatbot } from './describeChatbotReading';
import { chatbotDoor } from './businessBrainDoor';
import type { BusinessBrainChatbot } from '$lib/data/businessBrainChatbotRules';
import type { BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import type { McpCaller } from '../resolveMcpCaller';

/** Every chatbot the caller may use now, by the email they sign in with. */
export async function listChatbotsToUse(caller: McpCaller): Promise<string> {
	const reaches = await readChatbotsForPerson(caller.supabase, caller.email);
	return describeChatbotsToUse(reaches);
}

/** The index of the parts the chatbot reads, or of the one part asked when it reads that part. */
export async function readChatbotIndex(caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach): Promise<string> {
	const asked = validateBusinessBrainPart(input);
	if (typeof asked === 'string') return asked;
	const { organisation, chatbot } = reach;
	const parts = partsToList(chatbot, asked.part);
	if (parts.length === 0) return partOutsideChatbot(chatbot);
	const index = await readBrainIndexOfParts(caller.supabase, organisation.id, parts);
	return describeBusinessBrainIndex(chatbotDoor(reach), index);
}

/** The pages in the parts the chatbot reads that match the words, best first. */
export async function searchChatbot(caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach): Promise<string> {
	const asked = validateBusinessBrainSearch(input);
	if (typeof asked === 'string') return asked;
	const { organisation, chatbot } = reach;
	const matches = await searchBusinessBrainParts(caller.supabase, organisation.id, asked.searchText, chatbot.parts);
	if (matches === null) return chatbotSearchNotReadyYet;
	return describeBusinessBrainSearch(chatbotDoor(reach), asked.searchText, matches);
}

function partsToList(chatbot: BusinessBrainChatbot, part: BusinessBrainPartKind | null): BusinessBrainPartKind[] {
	if (part === null) return chatbot.parts;
	return chatbot.parts.filter((covered) => covered === part);
}
