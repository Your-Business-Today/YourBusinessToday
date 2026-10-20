import { describeSummary } from './describeSummary';
import { getOwedTasks } from './owedTasks';
import { getWaitingQuestionsFor } from './waitingQuestionsFor';
import { objectSchema, readOptionalText } from '../actionTypes';
import { reachableProjectIds } from '../projectAccess';
import { summaryWalkthrough } from './summaryWalkthrough';
import { titleNameField } from './waitingActions';
import type { McpAction } from '../actionTypes';

const summaryHeading = 'Your YBT summary: everything assigned to you and waiting on you, project by project.';

export const summaryActions: McpAction[] = [
	{
		name: 'read_ybt_summary',
		area: 'conversations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the YBT summary — every project you are on, each with the decisions waiting on you and ' +
			'the work assigned to you, and how to walk the person through them',
		guidance:
			'Use it whenever the person asks for their YBT summary, what they have on, or what needs ' +
			'them across their projects. Its answer opens with how to give the summary: the list ' +
			'project by project, then the quick decisions put to the person one at a time and ' +
			'answered with post_message, then the bigger work one task at a time. It holds what ' +
			'list_waiting_on_me holds, grouped by project.',
		inputSchema: objectSchema({ name: titleNameField }),
		run: async (caller, input) => {
			const waiting = await getWaitingQuestionsFor(caller);
			const owed = await getOwedTasks(caller, readOptionalText(input, 'name'));
			const projectOrder = reachableProjectIds(caller);
			const summary = describeSummary({ waiting, owed, viewerId: caller.accountId, projectOrder });
			return [summaryWalkthrough, '', summaryHeading, '', ...summary].join('\n');
		}
	}
];
