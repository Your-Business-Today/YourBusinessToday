import type { SupabaseClient } from '@supabase/supabase-js';
import { readEveryRow } from '$lib/server/schema/readEveryRow';

/** A goal or task whose baton is with someone: the open question on it, who asked, and who must answer. */
export type Baton = {
	messageId: string;
	taskId: string | null;
	goalId: string | null;
	askedById: string;
	waitingOnId: string;
	since: string;
};

const batonColumns = 'message_id, task_id, goal_id, author_account_id, awaiting_account_id, created_at';

/** Every goal and task the viewer can see whose baton is with somebody other than the viewer. */
export async function getBatonsWithOthers(supabase: SupabaseClient, viewerId: string): Promise<Baton[]> {
	const rows = await readEveryRow((firstRow, lastRow) =>
		supabase
			.from('conversation_turns')
			.select(batonColumns)
			.not('awaiting_account_id', 'is', null)
			.neq('awaiting_account_id', viewerId)
			.order('created_at', { ascending: true })
			.range(firstRow, lastRow)
	);
	return rows.map(parseBaton);
}

function parseBaton(row: Record<string, unknown>): Baton {
	return {
		messageId: row.message_id as string,
		taskId: (row.task_id as string) ?? null,
		goalId: (row.goal_id as string) ?? null,
		askedById: row.author_account_id as string,
		waitingOnId: row.awaiting_account_id as string,
		since: row.created_at as string
	};
}
