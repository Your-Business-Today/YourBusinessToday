import { asOneList } from '$lib/server/projects/asOneList';
import { forOrganisation, listedName, noSuchProject, openWorkPhrase } from './describeProject';
import { getAssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';
import { getProjectsForOwner, type ProjectSummary } from '$lib/server/projects/getProjectsForOwner';
import { getTeamProjects, type TeamProject } from '$lib/server/members/getTeamProjects';
import { everyOrganisationFilter, matchesOrganisationFilter } from '$lib/data/organisationFilter';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { projectStatusLabels } from '$lib/data/projectStatus';
import { reachableProject } from '../projectAccess';
import { topRank } from '$lib/data/topRank';
import { whatReadProjectSays } from './whatReadProjectSays';
import type { McpAction } from '../actionTypes';

/** A project with its number in the caller's whole projects list, which is the number set_project_priority takes. */
type PlacedProject = { project: ProjectSummary | TeamProject; place: number };

export const projectReadActions: McpAction[] = [
	{
		name: 'list_projects',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'every project you own or are on, as one list in your own priority order, saying who owns each — all of them, or those under one organisation',
		inputSchema: objectSchema({
			organisationId: textField(
				'Narrow to the projects under one organisation, as list_organisations gives it'
			)
		}),
		run: async (caller, input) => {
			const assignedTaskCounts = await getAssignedTaskCounts(caller.supabase, caller.accountId);
			const filter = readOptionalText(input, 'organisationId') ?? everyOrganisationFilter;
			const ownProjects = await getProjectsForOwner(caller.supabase, caller.accountId, assignedTaskCounts);
			const teamProjects = await getTeamProjects(caller.supabase, caller.accountId, assignedTaskCounts);
			const placedProjects = asOneList(ownProjects, teamProjects).map((project, index) => ({ project, place: index + topRank }));
			const shown = placedProjects.filter(({ project }) => matchesOrganisationFilter(project.organisationId, filter));
			if (shown.length === 0) return 'You have no projects yet. Call create_project to start one.';
			return ['Your projects, in your own priority order:', ...shown.map(placedProjectLine)].join('\n');
		}
	},
	{
		name: 'read_project',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'read one project with its goals, its whole backlog, its development work by build stage with the weekly velocity, its refactor cadence and the project-process kit version its repository is on; an internal project, with no repository and no development work, gives its Internal work alone',
		inputSchema: objectSchema({ projectId: textField('The project id') }, ['projectId']),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			return whatReadProjectSays(caller.supabase, project);
		}
	}
];

function placedProjectLine({ project, place }: PlacedProject): string {
	const status = projectStatusLabels[project.status];
	const owner = 'ownerName' in project ? `owned by ${project.ownerName}` : 'yours';
	const openWork = openWorkPhrase(project);
	return `${listedName(project)} — ${status}${forOrganisation(project)}, ${openWork}, ${owner} (priority ${place}, id: ${project.id})`;
}
