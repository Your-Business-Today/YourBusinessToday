import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { accountNameLookup } from '$lib/data/accountNames';
import { taskStatusLabels } from '$lib/data/taskStatus';
import { findParentTitles } from './taskDeletionSurroundings';
import { findTaskDeletions, type TaskDeletion } from './taskDeletionReading';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A deleted task as the project's page lists it: what it was, what it was under, who deleted it, when, and its files. */
export type DeletedTask = {
	deletionId: string;
	title: string;
	statusLabel: string;
	parentTitle: string | null;
	deletedByName: string;
	deletedAt: string;
	putBackAt: string | null;
	attachedFilenames: string[];
};

const parentNoLongerThere = 'a task no longer there';
const somebodyUnrecorded = 'nobody the record names';

/**
 * The tasks deleted from a project, newest first. The record is read with the service role, since row level
 * security lets nobody read it, so whoever calls this has already been let onto the project.
 */
export async function readDeletedTasks(serviceSupabase: SupabaseClient, projectId: string): Promise<DeletedTask[]> {
	const deletions = await findTaskDeletions(serviceSupabase, projectId);
	const deleterIds = deletions.map((deletion) => deletion.deletedByAccountId).filter((accountId) => accountId !== null);
	const nameOf = accountNameLookup(await getAccountsById(serviceSupabase, deleterIds));
	const parentTitles = await findParentTitles(serviceSupabase, deletions);
	return deletions.map((deletion) => ({
		deletionId: deletion.id,
		title: deletion.title,
		statusLabel: taskStatusLabels[deletion.status],
		parentTitle: parentTitleOf(deletion, parentTitles),
		deletedByName: deletion.deletedByAccountId === null ? somebodyUnrecorded : nameOf(deletion.deletedByAccountId),
		deletedAt: deletion.deletedAt,
		putBackAt: deletion.putBackAt,
		attachedFilenames: deletion.attachedFilenames
	}));
}

function parentTitleOf(deletion: TaskDeletion, parentTitles: Map<string, string>): string | null {
	if (deletion.parentTaskId === null) return null;
	return parentTitles.get(deletion.parentTaskId) ?? parentNoLongerThere;
}
