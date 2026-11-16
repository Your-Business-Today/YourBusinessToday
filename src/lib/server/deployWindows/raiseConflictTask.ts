import type { SupabaseClient } from '@supabase/supabase-js';
import { createTask } from '$lib/server/projects/createTask';
import { conflictTaskDetails, conflictTaskTitle, hasOpenConflictTask } from './promotionConflict';
import { taskKinds } from '$lib/data/taskKind';
import type { Promotion } from './promoteStaging';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/**
 * Raises the task that puts a conflicting promotion right, in the owner's name and unsorted into a goal, unless one is already open.
 * Null when nothing was raised.
 */
export async function raiseConflictTaskOnce(
	supabase: SupabaseClient,
	project: Project,
	promotion: Promotion,
	tasks: ProjectTask[]
): Promise<string | null> {
	if (!promotion.hasConflict) return null;
	if (hasOpenConflictTask(tasks, project)) return null;
	return createTask(
		supabase,
		project.id,
		{
			title: conflictTaskTitle(project),
			details: conflictTaskDetails(project, promotion.pullRequestUrl),
			dueDate: null,
			parentTaskId: null,
			waitsForTaskId: null,
			goalId: null,
			kind: taskKinds.work
		},
		project.ownerId
	);
}
