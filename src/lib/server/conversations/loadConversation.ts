import type { SupabaseClient } from '@supabase/supabase-js';
import { conversationAccountIds } from './conversationAccountIds';
import { getAccountDirectory } from '$lib/server/accounts/getAccountDirectory';
import { getConversationParticipantIds } from './getConversationParticipantIds';
import { getThread } from './getThread';
import { suggestHandOff } from './defaultHandOff';
import { withAuthorNames } from './withAuthorNames';
import type { ConversationSubject } from './conversationSubject';

export type ConversationViewer = { viewerId: string; raisedById: string | null };

/** A goal or task's conversation as its page shows it, to the person viewing it. */
export async function loadConversation(
	supabase: SupabaseClient,
	subject: ConversationSubject,
	viewer: ConversationViewer
) {
	const [messages, participantIds] = await Promise.all([
		getThread(supabase, subject, true),
		getConversationParticipantIds(supabase, subject)
	]);
	const accounts = await getAccountDirectory(supabase, conversationAccountIds(messages));
	return {
		messages: withAuthorNames(messages, accounts),
		participantIds,
		viewerId: viewer.viewerId,
		suggestedHandOff: suggestHandOff(messages, viewer.viewerId, viewer.raisedById)
	};
}
