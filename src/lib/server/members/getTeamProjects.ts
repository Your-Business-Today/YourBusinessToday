import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';
import type { AssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';

/** A project as one of its members sees it: `priority` is the member's own rank for it, not the owner's. */
export type TeamProject = Project & {
	ownerName: string;
	openTaskCount: number;
	assignedTaskCount: number;
};

/** The projects one person is on but does not own, in their own order, with who owns each and how much of it is theirs. */
export async function getTeamProjects(
	supabase: SupabaseClient,
	accountId: string,
	assignedTaskCounts: AssignedTaskCounts
): Promise<TeamProject[]> {
	const { data, error } = await supabase.rpc('team_projects', { member: accountId });
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => {
		const project = parseProjectRecord(row.project as Record<string, unknown>);
		return {
			...project,
			priority: row.member_priority as number,
			ownerName: row.owner_name as string,
			openTaskCount: row.open_task_count as number,
			assignedTaskCount: assignedTaskCounts.forProject(project.id)
		};
	});
}
