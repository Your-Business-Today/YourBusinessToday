import { describeProjectLine, forOrganisation, noSuchProject, openWorkPhrase } from './describeProject';
import { getAssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';
import { getProjectsForOwner } from '$lib/server/projects/getProjectsForOwner';
import { getTeamProjects, type TeamProject } from '$lib/server/members/getTeamProjects';
import { everyOrganisationFilter, matchesOrganisationFilter } from '$lib/data/organisationFilter';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { projectStatusLabels } from '$lib/data/projectStatus';
import { reachableProject } from '../projectAccess';
import { whatReadProjectSays } from './whatReadProjectSays';
import type { McpAction } from '../actionTypes';
import type { Project } from '$lib/server/projects/projectRecord';

export const projectReadActions: McpAction[] = [
	{
		name: 'list_projects',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the projects you own, in priority order, then the projects you are on as a team member, in your own order — all of them, or those under one organisation',
		inputSchema: objectSchema({
			organisationId: textField(
				'Narrow to the projects under one organisation, as list_organisations gives it'
			)
		}),
		run: async (caller, input) => {
			const assignedTaskCounts = await getAssignedTaskCounts(caller.supabase, caller.accountId);
			const filter = readOptionalText(input, 'organisationId') ?? everyOrganisationFilter;
			const underFilter = (project: Project) => matchesOrganisationFilter(project.organisationId, filter);
			const owned = (await getProjectsForOwner(caller.supabase, caller.accountId, assignedTaskCounts)).filter(underFilter);
			const team = (await getTeamProjects(caller.supabase, caller.accountId, assignedTaskCounts)).filter(underFilter);
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
			'read one project with its goals, its whole backlog, its development work by build stage with the weekly velocity, its refactor cadence and the project-process kit version its repository is on',
		inputSchema: objectSchema({ projectId: textField('The project id') }, ['projectId']),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			return whatReadProjectSays(caller.supabase, project);
		}
	}
];

function teamProjectLine(project: TeamProject): string {
	const status = projectStatusLabels[project.status];
	const place = `priority ${project.priority} among your team projects, id: ${project.id}`;
	return `${project.name} — ${status}${forOrganisation(project)}, ${openWorkPhrase(project)}, owned by ${project.ownerName} (${place})`;
}
