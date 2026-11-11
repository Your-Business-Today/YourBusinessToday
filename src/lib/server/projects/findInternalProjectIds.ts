import type { SupabaseClient } from '@supabase/supabase-js';
import { developmentSideDepartments, hasNoRepository } from '$lib/data/internalProject';

type ListedProject = { id: string; repositoryUrl: string };

const tablesHoldingWork = ['tasks', 'goals'];

/**
 * The projects among these that are internal: no repository, and not one development or infrastructure
 * task or goal. Only the projects with no repository are asked, each at once, for one piece of development work.
 */
export async function findInternalProjectIds(supabase: SupabaseClient, projects: ListedProject[]): Promise<Set<string>> {
	const unrepositoried = projects.filter(hasNoRepository);
	const standings = await Promise.all(
		unrepositoried.map(async ({ id }) => ({ id, isInternal: !(await holdsDevelopmentWork(supabase, id)) }))
	);
	return new Set(standings.filter(({ isInternal }) => isInternal).map(({ id }) => id));
}

async function holdsDevelopmentWork(supabase: SupabaseClient, projectId: string): Promise<boolean> {
	const reads = tablesHoldingWork.map((table) => firstDevelopmentRow(supabase, table, projectId));
	const answers = await Promise.all(reads);
	return answers.some((hasRow) => hasRow);
}

async function firstDevelopmentRow(supabase: SupabaseClient, table: string, projectId: string): Promise<boolean> {
	const { data, error } = await supabase
		.from(table)
		.select('id')
		.eq('project_id', projectId)
		.in('department', developmentSideDepartments)
		.limit(1);
	if (error) throw error;
	return data.length > 0;
}
