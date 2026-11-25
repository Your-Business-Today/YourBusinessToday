import { canManageOrganisation, notAnOrganisationManager } from '../organisationAccess';
import { deleteChatbotQuestion, isQuestionOnTheRecord, noSuchQuestionOnTheRecord } from '$lib/server/businessBrain/deleteChatbotQuestion';
import { readBusinessBrainChatbots } from '$lib/server/businessBrain/readBusinessBrainChatbots';
import { readChatbotRecordDeletions } from '$lib/server/businessBrain/readChatbotRecordDeletions';
import { readChatbotRecordKeeping, setChatbotRecordKeeping } from '$lib/server/businessBrain/chatbotRecordKeeping';
import { validateChatbotQuestionToDelete, validateChatbotRecordKeptDays } from '$lib/server/businessBrain/validateChatbotRecordKeeping';
import { validateRecordId } from '$lib/data/isUuid';
import { readOptionalText } from '../actionTypes';
import { describeChatbotRecordDeletions, keepingSet, questionDeleted } from './describeChatbotRecordKeeping';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** Deletes one question from the organisation's chatbot record, as its manager asks. */
export async function deleteQuestionFromRecord(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	if (!canManageOrganisation(caller, organisation)) return notAnOrganisationManager;
	const asked = validateChatbotQuestionToDelete(input);
	if (typeof asked === 'string') return asked;
	const { supabase, accountId } = caller;
	const { questionId } = asked;
	const isOnRecord = await isQuestionOnTheRecord(supabase, organisation.id, questionId);
	if (!isOnRecord) return noSuchQuestionOnTheRecord;
	await deleteChatbotQuestion(supabase, { organisationId: organisation.id, accountId, questionId });
	return questionDeleted(questionId);
}

/** Sets how long the organisation keeps its chatbot record, as its manager asks. */
export async function setRecordKeeping(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	if (!canManageOrganisation(caller, organisation)) return notAnOrganisationManager;
	const kept = validateChatbotRecordKeptDays(input);
	if (typeof kept === 'string') return kept;
	const { supabase, accountId } = caller;
	await setChatbotRecordKeeping(supabase, { organisationId: organisation.id, accountId, keptDays: kept.keptDays });
	return keepingSet(organisation, kept.keptDays);
}

/** How long the record is kept and the latest deletions from it, for the organisation's manager. */
export async function listRecordDeletions(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): Promise<string> {
	if (!canManageOrganisation(caller, organisation)) return notAnOrganisationManager;
	const chatbotId = readOptionalText(input, 'chatbotId');
	const chatbotRefusal = chatbotId === null ? null : validateRecordId('chatbotId', chatbotId);
	if (chatbotRefusal !== null) return chatbotRefusal;
	const { supabase } = caller;
	const keeping = await readChatbotRecordKeeping(supabase, organisation.id);
	const deletions = await readChatbotRecordDeletions(supabase, organisation.id, chatbotId);
	const chatbots = await readBusinessBrainChatbots(supabase, organisation.id, null);
	const chatbotNames = new Map(chatbots.map((chatbot) => [chatbot.chatbotId, chatbot.name]));
	return describeChatbotRecordDeletions(keeping, deletions, chatbotNames);
}
