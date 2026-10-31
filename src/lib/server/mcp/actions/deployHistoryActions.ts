import { carriedTaskPhrase, deployHistoryOf, recentDeployCount, type Deploy } from '$lib/data/deployHistory';
import { formatUkDateTime } from '$lib/data/britishDate';
import { getTasksForProject } from '$lib/server/projects/getTasksForProject';
import { noSuchProject } from './describeProject';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import type { McpAction } from '../actionTypes';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export const nothingLiveYet = 'No deploy has carried a task live on this project yet.';

export const deployHistoryActions: McpAction[] = [
	{
		name: 'read_deploy_history',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary: `what went live in each of a project’s last ${recentDeployCount} deploys, newest first: when each went live and the tasks it carried`,
		guidance:
			'Read it to answer "what went live last night" or to tell a co-owner what has shipped. A deploy is the ' +
			'promotion of staging to the default branch, and every task it carried went live at the same moment. ' +
			'What is merged into staging and not live yet is not here: read_project names it.',
		inputSchema: objectSchema({ projectId: textField('The project id') }, ['projectId']),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const tasks = await getTasksForProject(caller.supabase, project.id);
			const deploys = deployHistoryOf(tasks);
			if (deploys.length === 0) return nothingLiveYet;
			return deploys.map(describeDeploy).join('\n\n');
		}
	}
];

function describeDeploy(deploy: Deploy<ProjectTask>): string {
	const heading = `Went live ${formatUkDateTime(deploy.liveAt)} UK time, ${carriedTaskPhrase(deploy.tasks)}:`;
	return [heading, ...deploy.tasks.map((task) => `- ${task.title} (id: ${task.id})`)].join('\n');
}
