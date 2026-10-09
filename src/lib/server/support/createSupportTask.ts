import type { SupabaseClient } from '@supabase/supabase-js';
import { createTask } from '$lib/server/projects/createTask';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { setTaskUserStory } from '$lib/server/projects/setTaskUserStory';
import type { Project } from '$lib/server/projects/projectRecord';

export type SupportTaskSeed = {
	goalId: string | null;
	parentTaskId: string | null;
	title: string;
	want: string;
	benefit: string;
	raiserRole: string;
};

export async function createSupportTask(
	supabase: SupabaseClient,
	project: Project,
	seed: SupportTaskSeed,
	raisedBy: string
): Promise<string> {
	const taskId = await createTask(
		supabase,
		project.id,
		{
			title: seed.title,
			details: seed.want,
			dueDate: null,
			parentTaskId: seed.parentTaskId,
			waitsForTaskId: null,
			goalId: seed.goalId,
			kind: 'support'
		},
		raisedBy
	);
	await setTaskUserStory(supabase, taskId, {
		role: seed.raiserRole,
		want: seed.title,
		benefit: seed.benefit
	});
	await recordRaise(supabase, project, taskId, seed.title, raisedBy);
	return taskId;
}

async function recordRaise(
	supabase: SupabaseClient,
	project: Project,
	taskId: string,
	title: string,
	raisedBy: string
): Promise<void> {
	if (project.clientId === null) return;
	await recordClientEvent(supabase, project.clientId, 'request_raised', { taskId, title }, raisedBy);
}
