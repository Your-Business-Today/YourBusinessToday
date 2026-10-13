import type { SupabaseClient } from '@supabase/supabase-js';
import { createTask } from '$lib/server/projects/createTask';
import { failedRunDetails, failedRunTitle } from './failedRunTask';
import { taskKinds } from '$lib/data/taskKind';
import type { FinishedRun } from '$lib/data/mainRun';
import type { Project } from '$lib/server/projects/projectRecord';

/** Raises "FIX: <check> failed on <branch> in <repository>" on the project, in the owner's name, unsorted into a goal. */
export async function raiseFailedRunTask(supabase: SupabaseClient, project: Project, run: FinishedRun): Promise<string> {
	return createTask(
		supabase,
		project.id,
		{
			title: failedRunTitle(run, project.defaultBranch),
			details: failedRunDetails(run),
			dueDate: null,
			parentTaskId: null,
			waitsForTaskId: null,
			goalId: null,
			kind: taskKinds.work
		},
		project.ownerId
	);
}
