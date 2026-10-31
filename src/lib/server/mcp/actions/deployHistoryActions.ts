import { carriedTaskPhrase, deployHistoryOf, recentDeployCount, type Deploy } from '$lib/data/deployHistory';
import { filterDeploys, type DeployFilter } from '$lib/data/deployHistoryFilter';
import { formatUkDateTime } from '$lib/data/britishDate';
import { findLiveTasks } from '$lib/server/projects/findLiveTasks';
import { noSuchProject } from './describeProject';
import { objectSchema, readOptionalText, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import type { McpAction } from '../actionTypes';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export const nothingLiveYet = 'No deploy has carried a task live on this project yet.';
export const nothingMatches = 'No deploy on this project carried a task that matches.';

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const noText = '';
const mostDeploysShown = 50;

export const deployHistoryActions: McpAction[] = [
	{
		name: 'read_deploy_history',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary: `what went live in a project’s deploys, newest first — the last ${recentDeployCount}, or every one matching words in a task’s title or a range of UK dates`,
		guidance:
			'Read it to answer "what went live last night", "when did the invoice export go live" or to tell a co-owner ' +
			'what has shipped. A deploy is the promotion of staging to the default branch, by its window or by Deploy now, ' +
			'and every task it carried went live at the same moment. What is merged into staging and not live yet is not ' +
			'here: read_project names it.',
		inputSchema: objectSchema(
			{
				projectId: textField('The project id'),
				words: textField('Keep only the tasks whose titles hold these words'),
				fromDate: textField('The first UK day to include, as YYYY-MM-DD'),
				toDate: textField('The last UK day to include, as YYYY-MM-DD')
			},
			['projectId']
		),
		run: async (caller, input) => {
			const filter = readFilter(input);
			if (typeof filter === 'string') return filter;
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			const deploys = deployHistoryOf(await findLiveTasks(caller.supabase, project.id));
			if (deploys.length === 0) return nothingLiveYet;
			const found = filter === null ? deploys.slice(0, recentDeployCount) : filterDeploys(deploys, filter);
			if (found.length === 0) return nothingMatches;
			return found.slice(0, mostDeploysShown).map(describeDeploy).join('\n\n');
		}
	}
];

/** The filter asked for, null when none was, or the refusal naming a date that is not YYYY-MM-DD. */
function readFilter(input: Record<string, unknown>): DeployFilter | null | string {
	const words = readOptionalText(input, 'words') ?? noText;
	const fromDate = readOptionalText(input, 'fromDate') ?? noText;
	const toDate = readOptionalText(input, 'toDate') ?? noText;
	if (isMisshapenDate(fromDate)) return misshapenDateRefusal('fromDate');
	if (isMisshapenDate(toDate)) return misshapenDateRefusal('toDate');
	const isUnfiltered = words === noText && fromDate === noText && toDate === noText;
	return isUnfiltered ? null : { words, fromDate, toDate };
}

function isMisshapenDate(date: string): boolean {
	return date !== noText && !isoDatePattern.test(date);
}

function misshapenDateRefusal(field: string): string {
	return `${field} must be a date written YYYY-MM-DD; nothing was read.`;
}

function describeDeploy(deploy: Deploy<ProjectTask>): string {
	const heading = `Went live ${formatUkDateTime(deploy.liveAt)} UK time, ${carriedTaskPhrase(deploy.tasks)}:`;
	return [heading, ...deploy.tasks.map((task) => `- ${task.title} (id: ${task.id})`)].join('\n');
}
