import { parseHandOff, parsePostedVia, type HandOff, type PostedVia } from '$lib/data/conversationTurn';

export type ConversationMessage = {
	id: string;
	goalId: string | null;
	taskId: string | null;
	authorAccountId: string;
	body: string;
	isInternal: boolean;
	postedVia: PostedVia;
	awaiting: HandOff | null;
	pickedUpAt: string | null;
	createdAt: string;
};

export const messageColumns =
	'id, goal_id, task_id, author_account_id, body, is_internal, posted_via, awaiting_account_id, awaiting_kind, picked_up_at, created_at';

export function parseMessageRecord(row: Record<string, unknown>): ConversationMessage {
	return {
		id: row.id as string,
		goalId: (row.goal_id as string) ?? null,
		taskId: (row.task_id as string) ?? null,
		authorAccountId: row.author_account_id as string,
		body: row.body as string,
		isInternal: row.is_internal === true,
		postedVia: parsePostedVia(row.posted_via),
		awaiting: parseHandOff(row.awaiting_account_id, row.awaiting_kind),
		pickedUpAt: (row.picked_up_at as string) ?? null,
		createdAt: row.created_at as string
	};
}
