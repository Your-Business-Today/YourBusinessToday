import type { SupabaseClient } from '@supabase/supabase-js';
import { isAwaitingAnswer, parseTaskKind } from '$lib/data/taskKind';
import { parseTaskStatus } from '$lib/data/taskStatus';

export type ClientProject = {
	id: string;
	name: string;
	repositoryUrl: string;
	environmentUrl: string;
	awaitingAnswerCount: number;
};

export async function getProjectsForClient(
	supabase: SupabaseClient,
	clientId: string
): Promise<ClientProject[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('id, name, repository_url, environment_url, tasks(kind, status)')
		.eq('client_id', clientId)
		.order('name');
	if (error) throw error;
	return data.map(toClientProject);
}

function toClientProject(row: Record<string, unknown>): ClientProject {
	const tasks = (row.tasks ?? []) as { kind: string; status: string }[];
	return {
		id: row.id as string,
		name: row.name as string,
		repositoryUrl: row.repository_url as string,
		environmentUrl: row.environment_url as string,
		awaitingAnswerCount: tasks.filter(
			(task) => isAwaitingAnswer(parseTaskKind(task.kind), parseTaskStatus(task.status))
		).length
	};
}
