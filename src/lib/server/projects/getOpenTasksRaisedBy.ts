import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { readEveryRow } from '$lib/server/schema/readEveryRow';
import {
	openSubjectColumns,
	parseOpenSubject,
	type OpenSubject
} from '$lib/server/conversations/getOpenSubjects';

/** The open tasks on these projects that this person asked for, or raised without naming anyone else as asking. */
export async function getOpenTasksRaisedBy(
	supabase: SupabaseClient,
	accountId: string,
	projectIds: string[]
): Promise<OpenSubject[]> {
	if (projectIds.length === 0) return [];
	const raisedByThem = `requested_by.eq.${accountId},and(created_by.eq.${accountId},requested_by.is.null)`;
	const rows = await readEveryRow((firstRow, lastRow) =>
		supabase
			.from('tasks')
			.select(openSubjectColumns)
			.in('project_id', projectIds)
			.neq('status', doneTaskStatus)
			.or(raisedByThem)
			.order('created_at', { ascending: true })
			.range(firstRow, lastRow)
	);
	return rows.map((row) => parseOpenSubject('task', row));
}
