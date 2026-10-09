import type { SupabaseClient } from '@supabase/supabase-js';
import { postMessage } from '$lib/server/conversations/postMessage';
import { recordClientEvent } from '$lib/server/clients/recordClientEvent';
import { doneTaskStatus } from '$lib/data/taskStatus';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const fullyComplete = 100;

export async function resolveSupportTask(
	supabase: SupabaseClient,
	task: ProjectTask,
	project: Project,
	resolution: string,
	resolvedBy: string
): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({
			status: doneTaskStatus,
			status_set_by: resolvedBy,
			completion_percent: fullyComplete,
			resolution,
			resolved_at: new Date().toISOString()
		})
		.eq('id', task.id);
	if (error) throw error;
	await postMessage(supabase, { taskId: task.id }, resolvedBy, resolutionSentence(resolution));
	await recordResolution(supabase, project, task, resolvedBy);
}

function resolutionSentence(resolution: string): string {
	return `Resolved: ${resolution}`;
}

async function recordResolution(
	supabase: SupabaseClient,
	project: Project,
	task: ProjectTask,
	resolvedBy: string
): Promise<void> {
	if (project.clientId === null) return;
	await recordClientEvent(
		supabase,
		project.clientId,
		'request_decided',
		{ taskId: task.id, title: task.title },
		resolvedBy
	);
}
