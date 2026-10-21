import type { SupabaseClient } from '@supabase/supabase-js';
import { subjectColumns, type ConversationSubject } from './conversationSubject';

/** Clears every baton on a goal's or task's thread: nobody is waiting on anything there now. */
export async function settleOpenQuestions(
	supabase: SupabaseClient,
	subject: ConversationSubject
): Promise<void> {
	const thread = subjectColumns(subject);
	const { error } = await supabase.rpc('settle_open_questions', {
		goal: thread.goal_id,
		task: thread.task_id
	});
	if (error) throw error;
}
