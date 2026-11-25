import { departments, type Department } from '$lib/data/department';
import { nextActionOf, type NextAction, type ThreadPost } from '$lib/data/nextAction';
import { getAssigneeIdsByTask } from './getAssigneeIdsByTask';
import { idBatches } from '$lib/server/schema/idBatches';
import { readEveryRow } from '$lib/server/schema/readEveryRow';
import type { SupabaseClient } from '@supabase/supabase-js';

/** An open task as far as the next-action rule reads it. */
export type RuledTask = { id: string; department: Department; createdBy: string | null };

type PostRow = { task_id: string; author_account_id: string; awaiting_account_id: string | null; created_at: string };

/**
 * Who makes the next move on each open task, by the one rule every list and count follows. The
 * assignees are read here unless the page already holds them.
 */
export async function getNextActionsByTask(
	supabase: SupabaseClient,
	tasks: RuledTask[],
	knownAssigneeIds?: Map<string, string[]>
): Promise<Map<string, NextAction>> {
	const taskIds = tasks.map((task) => task.id);
	const [assigneeIdsByTask, postsByTask] = await Promise.all([
		knownAssigneeIds ?? getAssigneeIdsByTask(supabase, taskIds),
		getPostsByTask(supabase, taskIds)
	]);
	const nextActionFor = (task: RuledTask) =>
		nextActionOf({
			isDevelopment: task.department === departments.development,
			assigneeIds: assigneeIdsByTask.get(task.id) ?? [],
			raisedBy: task.createdBy,
			posts: postsByTask.get(task.id) ?? []
		});
	return new Map(tasks.map((task) => [task.id, nextActionFor(task)]));
}

async function getPostsByTask(supabase: SupabaseClient, taskIds: string[]): Promise<Map<string, ThreadPost[]>> {
	const batches = await Promise.all(idBatches(taskIds).map((batch) => readPosts(supabase, batch)));
	const postsByTask = new Map<string, ThreadPost[]>();
	for (const row of batches.flat()) {
		const posts = postsByTask.get(row.task_id) ?? [];
		posts.push({ authorAccountId: row.author_account_id, awaitingAccountId: row.awaiting_account_id, createdAt: row.created_at });
		postsByTask.set(row.task_id, posts);
	}
	return postsByTask;
}

async function readPosts(supabase: SupabaseClient, taskIds: string[]): Promise<PostRow[]> {
	const rows = await readEveryRow((firstRow, lastRow) =>
		supabase
			.from('conversation_messages')
			.select('task_id, author_account_id, awaiting_account_id, created_at')
			.in('task_id', taskIds)
			.order('created_at', { ascending: true })
			.range(firstRow, lastRow)
	);
	return rows as PostRow[];
}
