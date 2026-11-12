import type { SupabaseClient } from '@supabase/supabase-js';
import { asOneList } from './asOneList';
import { getProjectsForOwner, type ProjectSummary } from './getProjectsForOwner';
import { getTeamProjects, type TeamProject } from '$lib/server/members/getTeamProjects';
import { tallyProjectsInSite } from './tallyOwnedProjectsInSite';
import type { AssignedTaskCounts } from './getAssignedTaskCounts';
import type { ProjectTally } from './ownedProjectTallies';

/** A project on a person's projects list, whoever owns it. */
export type ListedProject = ProjectSummary & {
	isYours: boolean;
	ownerName: string;
};

const emptyTally: ProjectTally = {
	openTaskCount: 0,
	taskCount: 0,
	completionPercent: 0,
	longTermGoalCount: 0
};

/** Every project a person owns or is on, as their one list in their own order, whoever owns each. */
export async function getProjectsForUser(
	supabase: SupabaseClient,
	accountId: string,
	assignedTaskCounts: AssignedTaskCounts | Promise<AssignedTaskCounts>
): Promise<ListedProject[]> {
	const [ownedProjects, teamProjects] = await Promise.all([
		getProjectsForOwner(supabase, accountId, assignedTaskCounts),
		getTeamProjects(supabase, accountId, assignedTaskCounts)
	]);
	const teamProjectIds = teamProjects.map((project) => project.id);
	const teamTallies = await tallyProjectsInSite(supabase, teamProjectIds);
	const yours = ownedProjects.map((project) => ({ ...project, isYours: true, ownerName: '' }));
	const others = teamProjects.map((project) => asListedProject(project, teamTallies.get(project.id) ?? emptyTally));
	return asOneList(yours, others);
}

function asListedProject(project: TeamProject, tally: ProjectTally): ListedProject {
	return { ...project, ...tally, isYours: false };
}
