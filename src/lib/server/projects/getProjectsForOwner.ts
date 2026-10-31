import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';
import type { AssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';
import { getOwnedProjectTallies, type ProjectTally, type TaskTally } from './ownedProjectTallies';

export type ProjectProgress = TaskTally & { assignedTaskCount: number; longTermGoalCount: number };

export type ProjectSummary = Project & ProjectProgress & { organisationName: string };

const emptyTally: ProjectTally = { openTaskCount: 0, taskCount: 0, completionPercent: 0, longTermGoalCount: 0 };

export async function getProjectsForOwner(
	supabase: SupabaseClient,
	ownerId: string,
	assignedTaskCounts: AssignedTaskCounts | Promise<AssignedTaskCounts>
): Promise<ProjectSummary[]> {
	const projectsRead = supabase
		.from('projects')
		.select('*, organisations(name)')
		.eq('owner_id', ownerId)
		.order('priority', { ascending: true });
	const [{ data, error }, tallyByProject, countsByProject] = await Promise.all([
		projectsRead,
		getOwnedProjectTallies(supabase, ownerId),
		assignedTaskCounts
	]);
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => {
		const project = parseProjectRecord(row);
		return {
			...project,
			...(tallyByProject.get(project.id) ?? emptyTally),
			assignedTaskCount: countsByProject.forProject(project.id),
			organisationName: organisationNameOf(row)
		};
	});
}

function organisationNameOf(row: Record<string, unknown>): string {
	const organisation = row.organisations as { name: string } | null;
	return organisation?.name ?? '';
}
