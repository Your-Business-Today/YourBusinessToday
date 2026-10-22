import { describeChaseList } from './describeChaseList';
import { describeSummary } from './describeSummary';
import { getChaseList } from './chaseList';
import { getOwedTasks } from './owedTasks';
import { getWaitingQuestionsFor } from './waitingQuestionsFor';
import { objectSchema, readOptionalText } from '../actionTypes';
import { reachableProjectIds } from '../projectAccess';
import { summaryWalkthrough } from './summaryWalkthrough';
import { titleNameField } from './waitingActions';
import type { McpAction } from '../actionTypes';

const summaryHeading =
	'# What needs you\nYour YBT summary: every action item assigned to you and waiting on you, project by project.';

export const summaryActions: McpAction[] = [
	{
		name: 'read_ybt_summary',
		area: 'conversations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the YBT summary — every project you are on, each with the decisions waiting on you and ' +
			'the work assigned to you, then who to chase for what you are waiting on, and how to walk ' +
			'the person through them',
		guidance:
			'Use it whenever the person asks for their YBT summary, what is outstanding for them, what ' +
			'they have on, what needs them or who to chase across their projects. Its answer opens with ' +
			'how to give the summary: the list project by project, then who to chase person by person, ' +
			'then the quick decisions put to the person one at a time and answered with post_message, ' +
			'then the bigger work one task at a time. It holds what list_waiting_on_me holds, grouped ' +
			'by project, and the goals and tasks whose baton is with someone else.',
		inputSchema: objectSchema({ name: titleNameField }),
		run: async (caller, input) => {
			const [waiting, owed, chaseList] = await Promise.all([
				getWaitingQuestionsFor(caller),
				getOwedTasks(caller, readOptionalText(input, 'name')),
				getChaseList(caller)
			]);
			const projectOrder = reachableProjectIds(caller);
			const summary = describeSummary({ waiting, owed, viewerId: caller.accountId, projectOrder });
			const chase = describeChaseList(chaseList, caller.accountId);
			return [summaryWalkthrough, '', summaryHeading, '', ...summary, '', ...chase].join('\n');
		}
	}
];
