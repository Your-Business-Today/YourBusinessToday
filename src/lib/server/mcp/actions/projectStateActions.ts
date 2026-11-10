import { noSuchProject } from './describeProject';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import { describeHowProjectStands } from './projectStateReading';
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
			return describeHowProjectStands(caller.supabase, project, new Date());
		}
	}
];
