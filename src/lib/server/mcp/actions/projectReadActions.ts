import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { countDeploysSinceRefactor } from '$lib/server/deploys/countDeploysSinceRefactor';
import { describeProject, describeProjectLine, noSuchProject, openWorkPhrase } from './describeProject';
import { describeKitStanding, kitStanding } from '$lib/data/kitVersion';
import { kitReadingOf } from '$lib/server/kit/kitReadingOf';
import { describeRefactorCadence } from '$lib/server/refactor/isRefactorRoundDue';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getAssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';
import { getProjectsForOwner } from '$lib/server/projects/getProjectsForOwner';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { getTeamProjects, type TeamProject } from '$lib/server/members/getTeamProjects';
import { objectSchema, readText, textField } from '../actionTypes';
import { projectStatusLabels } from '$lib/data/projectStatus';
import { reachableProject } from '../projectAccess';
import type { McpAction } from '../actionTypes';
import type { Project } from '$lib/server/projects/projectRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export const projectReadActions: McpAction[] = [
	{
		name: 'list_projects',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the projects you own, in priority order, then the projects you are on as a team member, in your own order',
		inputSchema: objectSchema({}),
		run: async (caller) => {
			const assignedTaskCounts = await getAssignedTaskCounts(caller.supabase, caller.accountId);
			const owned = await getProjectsForOwner(caller.supabase, caller.accountId, assignedTaskCounts);
			const team = await getTeamProjects(caller.supabase, caller.accountId, assignedTaskCounts);
			if (owned.length === 0 && team.length === 0) {
				return 'You have no projects yet. Call create_project to start one.';
			}
			return [
				'Your projects:',
				...(owned.length === 0 ? ['None yet.'] : owned.map(describeProjectLine)),
				'',
				'Team projects:',
				...(team.length === 0 ? ['None yet.'] : team.map(teamProjectLine))
			].join('\n');
		}
	},
	{
		name: 'read_project',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'read one project with its goals, its whole backlog, its refactor cadence and the project-process kit version its repository is on',
		inputSchema: objectSchema({ projectId: textField('The project id') }, ['projectId']),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const tasks = await getTasksForProject(caller.supabase, project.id);
			const goals = await getGoalsForProject(caller.supabase, project.id);
			const cadenceLine = await cadenceLineFor(caller.supabase, project);
			const kitLine = await kitLineFor(caller.supabase, project);
			return describeProject(project, goals, buildTaskTree(tasks), `${cadenceLine} ${kitLine}`);
		}
	}
];

async function cadenceLineFor(supabase: SupabaseClient, project: Project): Promise<string> {
	const deploysSinceRefactor = await countDeploysSinceRefactor(supabase, project);
	return describeRefactorCadence({ refactorEveryDeploys: project.refactorEveryDeploys, deploysSinceRefactor });
}

async function kitLineFor(supabase: SupabaseClient, project: Project): Promise<string> {
	const latestKitVersion = await getLatestKitVersion(supabase);
	const reading = kitReadingOf(project, latestKitVersion);
	return describeKitStanding(kitStanding(reading), reading);
}

function teamProjectLine(project: TeamProject): string {
	const status = projectStatusLabels[project.status];
	const place = `priority ${project.priority} among your team projects, id: ${project.id}`;
	return `${project.name} — ${status}, ${openWorkPhrase(project)}, owned by ${project.ownerName} (${place})`;
}
