import { parsePostedVia } from '$lib/data/conversationTurn';
import { chatDecisionStatuses, type ChatDecision, type ChatDecisionStatus } from '$lib/data/chat/chatDecisionRules';

export const chatDecisionsTable = 'chat_decisions';

export const chatDecisionColumns =
	'id, room_id, message_id, wording, raised_by_account_id, raised_via, waiting_on_account_id, status, outcome, closed_by_account_id, closed_at, created_at';

export type ChatDecisionRow = {
	id: string;
	room_id: string;
	message_id: string;
	wording: string;
	raised_by_account_id: string;
	raised_via: string;
	waiting_on_account_id: string;
	status: string;
	outcome: string | null;
	closed_by_account_id: string | null;
	closed_at: string | null;
	created_at: string;
};

function statusOf(value: string): ChatDecisionStatus {
	if (value === chatDecisionStatuses.closed) return chatDecisionStatuses.closed;
	return chatDecisionStatuses.open;
}

export function chatDecisionOf(row: ChatDecisionRow): ChatDecision {
	return {
		id: row.id,
		roomId: row.room_id,
		messageId: row.message_id,
		wording: row.wording,
		raisedByAccountId: row.raised_by_account_id,
		raisedVia: parsePostedVia(row.raised_via),
		waitingOnAccountId: row.waiting_on_account_id,
		status: statusOf(row.status),
		outcome: row.outcome,
		closedByAccountId: row.closed_by_account_id,
		closedAt: row.closed_at,
		createdAt: row.created_at
	};
}
