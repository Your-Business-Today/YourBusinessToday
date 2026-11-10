import { canManageOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { isQuestionAnswered, recordChatbotAnswer } from '$lib/server/businessBrain/recordChatbotAnswer';
import { isQuestionOfAsker } from '$lib/server/businessBrain/recordChatbotQuestion';
import { readBusinessBrainChatbots } from '$lib/server/businessBrain/readBusinessBrainChatbots';
import { readChatbotQuestionTrail } from '$lib/server/businessBrain/readChatbotQuestionTrail';
import { validateChatbotAnswerGiven } from '$lib/server/businessBrain/validateChatbotQuestion';
import { validateChatbotTrailFilters } from '$lib/server/businessBrain/validateChatbotTrailFilters';
import { answerAlreadyOnRecord, answerRecorded, describeChatbotTrail, noSuchQuestionOfYours, trailNotReadyYet } from './describeChatbotTrail';
import { askerOf, placeOf } from '../chatbotQuestionTrail';
import type { ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Puts the answer the person's Claude gave on the record, once, under a question that person asked through the chatbot. */
export async function recordAnswer(caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach): Promise<string> {
	const given = validateChatbotAnswerGiven(input);
	if (typeof given === 'string') return given;
	const { supabase } = caller;
	const place = placeOf(reach);
	const asker = askerOf(caller);
	const isTheirs = await isQuestionOfAsker(supabase, place, asker, given.questionId);
	if (!isTheirs) return noSuchQuestionOfYours;
	const isAnswered = await isQuestionAnswered(supabase, given.questionId);
	if (isAnswered) return answerAlreadyOnRecord;
	await recordChatbotAnswer(supabase, place, asker, given);
	const { questionId, pagesCited } = given;
	return answerRecorded(questionId, pagesCited.length);
}

/** The questions asked through the organisation's chatbots, narrowed as the manager asks, latest first. */
export async function listChatbotQuestions(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	if (!canManageOrganisation(caller, organisation)) return notAnOrganisationManager;
	const filters = validateChatbotTrailFilters(input);
	if (typeof filters === 'string') return filters;
	const { supabase } = caller;
	const trail = await readChatbotQuestionTrail(supabase, organisation.id, filters);
	if (trail === null) return trailNotReadyYet;
	const chatbots = await readBusinessBrainChatbots(supabase, organisation.id, null);
	const chatbotNames = new Map(chatbots.map((chatbot) => [chatbot.chatbotId, chatbot.name]));
	return describeChatbotTrail(organisation, trail, chatbotNames);
}
