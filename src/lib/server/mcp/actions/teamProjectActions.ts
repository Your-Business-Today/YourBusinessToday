import { noSuchProject } from './describeProject';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import { setTeamProject } from '$lib/server/projects/setTeamProject';
import { teamProjectAnswerRefusal, validateTeamProjectAnswer } from '$lib/data/teamProject';
import type { McpAction } from '../actionTypes';

export const teamProjectActions: McpAction[] = [
	{
		name: 'set_team_project',
		area: 'projects',
		audience: 'staff',
		isWrite: true,
		summary: 'make a project you are on a team project every staff member is on, or personal again',
		guidance:
			'A team project is one every Your Business Today staff member is on, and anyone made staff later ' +
			'joins it at once. Making it personal again takes off the staff it brought; anyone invited to the ' +
			'project directly, or on it through its organisation, stays. Its organisation is untouched.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project id'),
				isTeamProject: { type: 'boolean', description: 'true for a team project, false for personal' }
			},
			['projectId', 'isTeamProject']
		),
		run: async (caller, input) => {
			const isTeamProject = validateTeamProjectAnswer(input.isTeamProject);
			if (isTeamProject === null) return teamProjectAnswerRefusal;
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			await setTeamProject(caller.supabase, project.id, isTeamProject);
			if (isTeamProject) return `${project.name} is a team project; every staff member is on it.`;
			return `${project.name} is personal again; the staff it brought on are off it.`;
		}
	}
];
