import { describeProjectState } from './describeProjectState';
import { getGoalsForProject } from '$lib/server/goals/getGoalsForProject';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { getTaskTurns } from '$lib/server/conversations/conversationTurns';
import { noSuchProject } from './describeProject';
import { objectSchema, readText, textField } from '../actionTypes';
import { projectStateOf } from '$lib/server/projects/projectState';
import { reachableProject } from '../projectAccess';
import type { McpAction } from '../actionTypes';

export const projectStateActions: McpAction[] = [
	{
		name: 'read_project_state',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'how one project truly stands: Bugs open, Waiting on people, Stalled or On track, with its open bugs, who it waits on, its goals, its week and the next step',
		guidance:
			'Use it whenever the person asks how a project is doing, where it stands, or what is holding it up. ' +
			'It is read the same way as the card at the top of the project page, so the two never disagree. ' +
			'Lead with the verdict in one line, then the one thing that would move it: the bug to fix, or the ' +
			'person to answer.',
		inputSchema: objectSchema({ projectId: textField('The project id, as list_projects gives it') }, ['projectId']),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const { supabase } = caller;
			const [tasks, goals, people] = await Promise.all([
				getTasksForProject(supabase, project.id),
				getGoalsForProject(supabase, project.id),
				getPeopleOnProject(supabase, project.id)
			]);
			const turnsByTask = await getTaskTurns(supabase, tasks.map((task) => task.id));
			const now = new Date();
			const state = projectStateOf({ tasks, goals, turnsByTask, now });
			return describeProjectState({ projectName: project.name, state, people, now }).join('\n');
		}
	}
];
