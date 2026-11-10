import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { actionRaisingColumns, boardActionColumns, boardActionTables, parseActionRaisingRecord, parseBoardActionRecord } from './boardroomActionRecord';
import { actionRaisedAs, noMeetingActions, type ActionRaising, type MeetingActions } from '$lib/data/boardroomAction';
import { parseTaskStatus, taskStatusLabels } from '$lib/data/taskStatus';
import { parseTodoStatus, todoStatusLabels, todoStatuses } from '$lib/data/todo';

const madeTables = { task: 'tasks', todo: 'todos' } as const;

async function rowsOfMeeting(supabase: SupabaseClient, table: string, columns: string, meetingId: string) {
	const { data, error } = await supabase.from(table).select(columns).eq('meeting_id', meetingId);
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return (data ?? []) as unknown as Record<string, unknown>[];
}

function statusLabelOf(table: string, status: unknown): string {
	if (table === madeTables.task) return taskStatusLabels[parseTaskStatus(status)];
	return todoStatusLabels[parseTodoStatus(status) ?? todoStatuses.toDo];
}

/** How each task or to-do made from the raisings stands now, by its id; one no longer there is left out. */
async function standingsOf(raisings: ActionRaising[]): Promise<Record<string, string>> {
	if (raisings.length === 0) return {};
	const serviceClient = supabaseServiceClient();
	const reads = [actionRaisedAs.task, actionRaisedAs.todo].map(async (raisedAs) => {
		const table = madeTables[raisedAs];
		const madeIds = raisings.filter((raising) => raising.raisedAs === raisedAs).map((raising) => raising.madeId);
		if (madeIds.length === 0) return [];
		const { data, error } = await serviceClient.from(table).select('id, status').in('id', madeIds);
		if (error) throw error;
		return (data ?? []).map((row) => [row.id as string, statusLabelOf(table, row.status)] as const);
	});
	return Object.fromEntries((await Promise.all(reads)).flat());
}

/**
 * A meeting's actions, how each was raised, and how each task or to-do made from them stands now. The standing is
 * read with the service role, after the director check every caller has passed, and gives only its status. Nothing
 * at all until migration 0194 has run.
 */
export async function getActionsOfMeeting(supabase: SupabaseClient, meetingId: string): Promise<MeetingActions> {
	const [actionRows, raisingRows] = await Promise.all([
		rowsOfMeeting(supabase, boardActionTables.actions, boardActionColumns, meetingId),
		rowsOfMeeting(supabase, boardActionTables.raisings, actionRaisingColumns, meetingId)
	]);
	if (actionRows === null || raisingRows === null) return noMeetingActions;
	const raisings = raisingRows.map(parseActionRaisingRecord);
	const standings = await standingsOf(raisings);
	return { actions: actionRows.map(parseBoardActionRecord), raisings, standings };
}
