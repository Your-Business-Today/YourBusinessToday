import { feedEventSentence, isFeedEventFor, parseFeedScope, type FeedEvent } from '$lib/data/feedEvent';
import { feedScopes } from '$lib/data/feedEvent';
import { formatBritishDateTime } from '$lib/data/britishDate';
import { getFeedForProjects } from '$lib/server/feed/getFeedForProjects';
import { noSuchProject } from './describeProject';
import { objectSchema, readOptionalText, textField } from '../actionTypes';
import { canReachProject, reachableProjectIds } from '../projectAccess';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const feedActions: McpAction[] = [
	{
		name: 'read_project_feed',
		area: 'projects',
		audience: 'everyone',
		isWrite: false,
		summary:
			'what has happened across your projects, newest first: each task raised, started, put on hold, sent for review or done, and by whom',
		guidance:
			'This is the live record of the work moving, the same one the site shows at /projects/feed. ' +
			'Read it to tell your person what landed since they last looked. An event marked "yours" is ' +
			'on a task they asked for; scope "mine" keeps only those. A task done by a merged pull ' +
			'request names the merge, not a person.',
		inputSchema: objectSchema({
			projectId: textField('One project to read — leave out for every project you are on'),
			scope: textField('"mine" for only the tasks your person asked for — leave out for everything')
		}),
		run: async (caller, input) => {
			const projectIds = projectIdsFor(caller, readOptionalText(input, 'projectId'));
			if (projectIds === null) return noSuchProject;
			const scope = parseFeedScope(readOptionalText(input, 'scope'));
			const events = await getFeedForProjects(caller.supabase, { accountId: caller.accountId, projectIds, scope });
			if (events.length === 0) return nothingYet(scope);
			return events.map((event) => feedLine(event, caller.accountId)).join('\n');
		}
	}
];

function projectIdsFor(caller: McpCaller, projectId: string | null): string[] | null {
	if (projectId === null) return reachableProjectIds(caller);
	if (!canReachProject(caller, projectId)) return null;
	return [projectId];
}

function nothingYet(scope: string): string {
	if (scope === feedScopes.mine) return 'No task you asked for has moved yet.';
	return 'Nothing has happened on your projects yet.';
}

function feedLine(event: FeedEvent, viewerId: string): string {
	const yours = isFeedEventFor(event, viewerId) ? ' — yours' : '';
	const detail = event.detail === '' ? '' : ` ${event.detail}`;
	return `${formatBritishDateTime(event.createdAt)}: ${feedEventSentence(event)}${detail}${yours} (task id: ${event.taskId})`;
}
