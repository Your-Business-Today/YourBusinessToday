import type { SupabaseClient } from '@supabase/supabase-js';
import { parseTaskStatus, type TaskStatus } from '$lib/data/taskStatus';

type Row = Record<string, unknown>;

/** A task as the record of deletions keeps it: the copy of its row with its history, who deleted it and when (0242). */
export type TaskDeletion = {
	id: string;
	taskId: string;
	projectId: string;
	title: string;
	status: TaskStatus;
	parentTaskId: string | null;
	attachedFilenames: string[];
	record: Row;
	deletedByAccountId: string | null;
	deletedAt: string;
	putBackAt: string | null;
};

type TaskDeletionRow = {
	id: string;
	task_id: string;
	project_id: string;
	title: string;
	record: Row;
	deleted_by_account_id: string | null;
	deleted_at: string;
	put_back_at?: string | null;
};

export const taskDeletionsTable = 'task_deletions';

export const TaskDeletionReading = { mostShown: 50 } as const;

const deletionColumns = '*';

/** The project's latest deleted tasks, the newest first. */
export async function findTaskDeletions(supabase: SupabaseClient, projectId: string): Promise<TaskDeletion[]> {
	const { data, error } = await supabase
		.from(taskDeletionsTable)
		.select(deletionColumns)
		.eq('project_id', projectId)
		.order('deleted_at', { ascending: false })
		.range(0, TaskDeletionReading.mostShown - 1);
	if (error !== null) throw error;
	return (data as unknown as TaskDeletionRow[]).map(fromDeletionRow);
}

/** The latest tasks this person deleted, the newest first, whatever project they were on. */
export async function findTaskDeletionsBy(supabase: SupabaseClient, accountId: string): Promise<TaskDeletion[]> {
	const { data, error } = await supabase
		.from(taskDeletionsTable)
		.select(deletionColumns)
		.eq('deleted_by_account_id', accountId)
		.order('deleted_at', { ascending: false })
		.range(0, TaskDeletionReading.mostShown - 1);
	if (error !== null) throw error;
	return (data as unknown as TaskDeletionRow[]).map(fromDeletionRow);
}

/** The deletion with that id, or null when the record holds none. */
export async function findTaskDeletion(supabase: SupabaseClient, deletionId: string): Promise<TaskDeletion | null> {
	const { data, error } = await supabase
		.from(taskDeletionsTable)
		.select(deletionColumns)
		.eq('id', deletionId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return fromDeletionRow(data as unknown as TaskDeletionRow);
}

function fromDeletionRow(row: TaskDeletionRow): TaskDeletion {
	const record = row.record ?? {};
	const { status, parent_task_id: parentTaskId } = record;
	return {
		id: row.id,
		taskId: row.task_id,
		projectId: row.project_id,
		title: row.title,
		status: parseTaskStatus(status),
		parentTaskId: typeof parentTaskId === 'string' ? parentTaskId : null,
		attachedFilenames: filenamesIn(record.task_attachments),
		record,
		deletedByAccountId: row.deleted_by_account_id,
		deletedAt: row.deleted_at,
		putBackAt: row.put_back_at ?? null
	};
}

function filenamesIn(attachments: unknown): string[] {
	if (!Array.isArray(attachments)) return [];
	return (attachments as Row[]).map((attachment) => String(attachment.filename ?? ''));
}
