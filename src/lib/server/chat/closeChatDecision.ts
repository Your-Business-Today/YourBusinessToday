import { chatDecisionRefusals, chatDecisionStatuses, type ChatDecision, type ChatDecisionClosing } from '$lib/data/chat/chatDecisionRules';
import { validateDecisionClosing } from '$lib/data/chat/validateChatDecision';
import { chatDecisionColumns, chatDecisionOf, chatDecisionsTable, type ChatDecisionRow } from './chatDecisionRecord';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The organisation's decision of that id, open or closed, or null when it has none. */
export async function findDecisionById(serviceSupabase: SupabaseClient, organisationId: string, decisionId: string): Promise<ChatDecision | null> {
	const { data, error } = await serviceSupabase
		.from(chatDecisionsTable)
		.select(chatDecisionColumns)
		.eq('id', decisionId)
		.eq('organisation_id', organisationId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return chatDecisionOf(data as ChatDecisionRow);
}

/** Closes the decision while it is still open, or answers null when someone closed it a moment before. */
async function closeWhileOpen(serviceSupabase: SupabaseClient, closer: ChatRoomKeeper, closing: ChatDecisionClosing): Promise<ChatDecision | null> {
	const change = {
		status: chatDecisionStatuses.closed,
		outcome: closing.outcome,
		closed_by_account_id: closer.accountId,
		closed_at: new Date().toISOString()
	};
	const { data, error } = await serviceSupabase
		.from(chatDecisionsTable)
		.update(change)
		.eq('id', closing.decisionId)
		.eq('organisation_id', closer.organisationId)
		.eq('status', chatDecisionStatuses.open)
		.select(chatDecisionColumns)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return chatDecisionOf(data as ChatDecisionRow);
}

/**
 * Closes an open decision of the organisation with its outcome, once the outcome fits its column. Anyone who can use
 * the organisation's chat may close one, in an archived room too. A closed decision is not reopened. Or says why not.
 */
export async function closeChatDecision(serviceSupabase: SupabaseClient, closer: ChatRoomKeeper, input: Record<string, unknown>): Promise<ChatDecision | string> {
	const closing = validateDecisionClosing(input);
	if (typeof closing === 'string') return closing;
	const decision = await findDecisionById(serviceSupabase, closer.organisationId, closing.decisionId);
	if (decision === null) return chatDecisionRefusals.noSuchDecision;
	if (decision.status === chatDecisionStatuses.closed) return chatDecisionRefusals.alreadyClosed;
	const closed = await closeWhileOpen(serviceSupabase, closer, closing);
	if (closed === null) return chatDecisionRefusals.alreadyClosed;
	return closed;
}
