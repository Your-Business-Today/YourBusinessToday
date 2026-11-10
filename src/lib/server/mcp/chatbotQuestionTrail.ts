import { isQuestionOfAsker, openChatbotQuestion, readChatbotPlace, type ChatbotPlace } from '$lib/server/businessBrain/recordChatbotQuestion';
import { recordChatbotReading } from '$lib/server/businessBrain/recordChatbotReading';
import { noSuchQuestionOfYours, withTrailNote } from './actions/describeChatbotTrail';
import { refusedReading } from './actions/chatbotReadingResults';
import type { ChatbotReach } from '$lib/server/businessBrain/readChatbotReach';
import type { ChatbotAsker, ChatbotQuestionAsked, ChatbotReading, ChatbotReadingKind } from '$lib/data/businessBrainChatbotTrailRules';
import type { McpCaller } from './resolveMcpCaller';
import type { SupabaseClient } from '@supabase/supabase-js';

type ChatbotRun = (caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach) => Promise<ChatbotReading>;

/** A reading through a chatbot for a question: which one, the words asked and the run that reads. */
export type ChatbotReadingForQuestion = { kind: ChatbotReadingKind; asked: ChatbotQuestionAsked; run: ChatbotRun };

/** A reading the chatbot rule refused: which chatbot, which reading and the words asked. */
export type ChatbotReadingRefused = { chatbotId: string; kind: ChatbotReadingKind; asked: ChatbotQuestionAsked; refusal: string };

/** The person who asks, as they are now: their account and the email they sign in with, in lower case. */
export function askerOf(caller: McpCaller): ChatbotAsker {
	return { accountId: caller.accountId, email: caller.email.trim().toLowerCase() };
}

/** Where the chatbot a person may use is: its organisation and its id. */
export function placeOf(reach: ChatbotReach): ChatbotPlace {
	const { organisation, chatbot } = reach;
	return { organisationId: organisation.id, chatbotId: chatbot.chatbotId };
}

/** Reads through the chatbot only once the question is on its record, then records what the reading gave back. */
export async function readForQuestion(caller: McpCaller, input: Record<string, unknown>, reach: ChatbotReach, reading: ChatbotReadingForQuestion): Promise<string> {
	const { supabase } = caller;
	const { kind, asked, run } = reading;
	const place = placeOf(reach);
	const questionId = await questionToRecordUnder(supabase, place, askerOf(caller), asked);
	if (questionId === null) return noSuchQuestionOfYours;
	const result = await run(caller, input, reach);
	await recordChatbotReading(supabase, place, { questionId, kind, question: asked.question, reading: result });
	return withTrailNote(result.answer, questionId);
}

/** Records on the chatbot's record a reading the chatbot rule refused, when there is such a chatbot and someone to name. */
export async function recordRefusedReading(caller: McpCaller, refused: ChatbotReadingRefused): Promise<void> {
	const { supabase } = caller;
	const asker = askerOf(caller);
	const place = await readChatbotPlace(supabase, refused.chatbotId);
	const hasNoOneToName = asker.email === '';
	if (place === null || hasNoOneToName) return;
	const asked = { ...refused.asked, questionId: null };
	const questionId = (await questionToRecordUnder(supabase, place, asker, asked)) as string;
	const reading = refusedReading(refused.refusal);
	await recordChatbotReading(supabase, place, { questionId, kind: refused.kind, question: asked.question, reading });
}

async function questionToRecordUnder(
	supabase: SupabaseClient,
	place: ChatbotPlace,
	asker: ChatbotAsker,
	asked: ChatbotQuestionAsked
): Promise<string | null> {
	if (asked.questionId === null) return openChatbotQuestion(supabase, place, asker, asked.question);
	const isTheirs = await isQuestionOfAsker(supabase, place, asker, asked.questionId);
	if (!isTheirs) return null;
	return asked.questionId;
}
