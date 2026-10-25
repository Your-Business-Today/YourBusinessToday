import { deployStagingNow } from '$lib/server/deployWindows/deployStagingNow';
import { describePromotion, noRepositoryToDeploy } from '$lib/server/deployWindows/promotionSentence';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { noSuchProject } from './describeProject';
import { objectSchema, readText, textField } from '../actionTypes';
import { reachableProject } from '../projectAccess';
import { stagingBranch } from '$lib/data/stagingBranch';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const deployActions: McpAction[] = [
	{
		name: 'deploy_staging_now',
		area: 'projects',
		audience: 'everyone',
		isWrite: true,
		summary: `promote a project’s ${stagingBranch} branch to its default branch now, without waiting for its deploy window`,
		guidance:
			`Only when the person asks to deploy now: it does what the project’s deploy window does, at once. It opens the pull request from ${stagingBranch} ` +
			'into the default branch (or finds the one already open) with auto-merge on, and that merge is the deploy; nothing deploys from ' +
			`${stagingBranch} itself. The run is kept on the project as a deploy by hand, and the timed window still runs at its time when ` +
			`${stagingBranch} has moved on again. A failed run says what GitHub refused.`,
		inputSchema: objectSchema({ projectId: textField('The project id') }, ['projectId']),
		run: async (caller, input) => {
			const project = await reachableProject(caller, readText(input, 'projectId'));
			if (project === null) return noSuchProject;
			if (project.repositoryUrl === '') return noRepositoryToDeploy;
			const promotion = await deployStagingNow(caller.supabase, project, await callerName(caller));
			return describePromotion(promotion);
		}
	}
];

async function callerName(caller: McpCaller): Promise<string> {
	const accounts = await getAccountsById(caller.supabase, [caller.accountId]);
	return accounts[0]?.name ?? caller.email;
}
