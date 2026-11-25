import type { SupabaseClient } from '@supabase/supabase-js';

/** The question to delete, the organisation whose record holds it and who deletes it. */
export type ChatbotQuestionDeletion = { organisationId: string; accountId: string; questionId: string };

export const noSuchQuestionOnTheRecord = "No question with that id is on the organisation's chatbot record. Call list_business_brain_chatbot_questions for the ids.";

/** Whether the question is on the organisation's chatbot record. */
export async function isQuestionOnTheRecord(supabase: SupabaseClient, organisationId: string, questionId: string): Promise<boolean> {
	const { count, error } = await supabase
		.from('business_brain_chatbot_questions')
		.select('id', { count: 'exact', head: true })
		.eq('organisation_id', organisationId)
		.eq('id', questionId);
	if (error) throw error;
	return (count ?? 0) > 0;
}

/** Deletes the question with its readings and answer, and records the deletion, in one step of the database. */
export async function deleteChatbotQuestion(supabase: SupabaseClient, deletion: ChatbotQuestionDeletion): Promise<void> {
	const { organisationId, accountId, questionId } = deletion;
	const removal = { organisation: organisationId, question_to_delete: questionId, member: accountId };
	const { error } = await supabase.rpc('delete_business_brain_chatbot_question', removal);
	if (error) throw error;
}
