import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { openGoalStatus } from '$lib/data/goalStatus';
import { idBatches } from '$lib/server/schema/idBatches';

export type SubjectKind = 'goal' | 'task';

/** A goal or task still open on one of the reader's projects, as far as a list of who to chase needs it. */
export type OpenSubject = { kind: SubjectKind; id: string; title: string; projectName: string };

type BatchReader = (ids: string[]) => PromiseLike<{ data: unknown[] | null; error: unknown }>;

export const openSubjectColumns = 'id, title, project_id, projects(name)';

/** The tasks among these that are not done and sit on these projects, by id. */
export async function getOpenTasksAmong(
	supabase: SupabaseClient,
	taskIds: string[],
	projectIds: string[]
): Promise<Map<string, OpenSubject>> {
	const readBatch: BatchReader = (ids) =>
		supabase
			.from('tasks')
			.select(openSubjectColumns)
			.in('id', ids)
			.in('project_id', projectIds)
			.neq('status', doneTaskStatus);
	return readOpenSubjects('task', taskIds, readBatch);
}

/** The goals among these that are still open and sit on these projects, by id. */
export async function getOpenGoalsAmong(
	supabase: SupabaseClient,
	goalIds: string[],
	projectIds: string[]
): Promise<Map<string, OpenSubject>> {
	const readBatch: BatchReader = (ids) =>
		supabase
			.from('goals')
			.select(openSubjectColumns)
			.in('id', ids)
			.in('project_id', projectIds)
			.eq('status', openGoalStatus);
	return readOpenSubjects('goal', goalIds, readBatch);
}

async function readOpenSubjects(
	kind: SubjectKind,
	ids: string[],
	readBatch: BatchReader
): Promise<Map<string, OpenSubject>> {
	const batches = await Promise.all(idBatches(ids).map((batch) => readRows(readBatch, batch)));
	const subjects = batches.flat().map((row) => parseOpenSubject(kind, row));
	return new Map(subjects.map((subject) => [subject.id, subject]));
}

async function readRows(readBatch: BatchReader, ids: string[]): Promise<Record<string, unknown>[]> {
	const { data, error } = await readBatch(ids);
	if (error) throw error;
	return (data ?? []) as Record<string, unknown>[];
}

export function parseOpenSubject(kind: SubjectKind, row: Record<string, unknown>): OpenSubject {
	const project = row.projects as { name: string } | null;
	return { kind, id: row.id as string, title: row.title as string, projectName: project?.name ?? '' };
}
