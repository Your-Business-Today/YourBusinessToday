import { askerOf, placeOf } from '../chatbotQuestionTrail';
import { chatbotDoor } from './businessBrainDoor';
import { chatbotReadingKinds } from '$lib/data/businessBrainChatbotTrailRules';
import { describeBusinessBrainSearch } from './businessBrainListings';
import { openChatbotQuestion } from '$lib/server/businessBrain/recordChatbotQuestion';
import { pageAsListed, readingThatGave } from './chatbotReadingResults';
import { readChatbotsForPerson, type ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import { recordChatbotReading } from '$lib/server/businessBrain/recordChatbotReading';
import { searchBusinessBrainParts } from '$lib/server/businessBrain/searchBusinessBrain';
import type { BrainSearchScope, BrainSearched } from '$lib/data/myBrainsRules';
import type { McpCaller } from '../resolveMcpCaller';

/**
 * Every named brain in scope the person may use, each searched only once the question is on that chatbot's own
 * record, and the search recorded there, as a search through the chatbot itself would be.
 */
export async function searchChatbotBrains(caller: McpCaller, scope: BrainSearchScope, question: string): Promise<BrainSearched[]> {
	const reaches = await readChatbotsForPerson(caller.supabase, caller.email);
	const inScope = reaches.filter(({ organisation }) => scope.organisationId === null || scope.organisationId === organisation.id);
	return Promise.all(inScope.map((reach) => searchChatbotOnRecord(caller, reach, { ...scope, question })));
}

async function searchChatbotOnRecord(
	caller: McpCaller,
	reach: ChatbotReach,
	asked: BrainSearchScope & { question: string }
): Promise<BrainSearched> {
	const { supabase } = caller;
	const { organisation, chatbot } = reach;
	const place = placeOf(reach);
	const { question, searchText } = asked;
	const questionId = await openChatbotQuestion(supabase, place, askerOf(caller), question);
	const matches = (await searchBusinessBrainParts(supabase, organisation.id, searchText, chatbot.parts)) ?? [];
	const answer = describeBusinessBrainSearch(chatbotDoor(reach), searchText, matches);
	const reading = readingThatGave(answer, { searchWords: searchText }, matches.map(pageAsListed));
	await recordChatbotReading(supabase, place, { questionId, kind: chatbotReadingKinds.search, question, reading });
	const readOnWith = `read_chatbot_page with chatbotId ${chatbot.chatbotId} and questionId ${questionId}`;
	return { name: chatbot.name, purpose: chatbot.purpose, readOnWith, pagesFound: matches };
}
