import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { chatbotRecordKeepingLimits, type ChatbotRecordDeletion, type ChatbotRecordDeletionReason } from '$lib/data/chatbotRecordKeepingRules';

type DeletionRow = {
	question_id: string;
	chatbot_id: string;
	question_asked_at: string;
	deleted_at: string;
	deleted_by_email: string | null;
	reason: ChatbotRecordDeletionReason;
};

const firstListedRow = 0;
const lastListedRow = chatbotRecordKeepingLimits.mostDeletionsListed - 1;

/** The latest deletions from the organisation's chatbot record, of one chatbot or all; none until migration 0291 has run. */
export async function readChatbotRecordDeletions(
	supabase: SupabaseClient,
	organisationId: string,
	chatbotId: string | null
): Promise<ChatbotRecordDeletion[]> {
	let query = supabase
		.from('business_brain_chatbot_record_deletions')
		.select('question_id, chatbot_id, question_asked_at, deleted_at, deleted_by_email, reason')
		.eq('organisation_id', organisationId);
	if (chatbotId !== null) query = query.eq('chatbot_id', chatbotId);
	const { data, error } = await query.order('deleted_at', { ascending: false }).range(firstListedRow, lastListedRow);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return ((data ?? []) as DeletionRow[]).map(deletionOf);
}

function deletionOf(row: DeletionRow): ChatbotRecordDeletion {
	return {
		questionId: row.question_id,
		chatbotId: row.chatbot_id,
		questionAskedAt: row.question_asked_at,
		deletedAt: row.deleted_at,
		deletedByEmail: row.deleted_by_email,
		reason: row.reason
	};
}
