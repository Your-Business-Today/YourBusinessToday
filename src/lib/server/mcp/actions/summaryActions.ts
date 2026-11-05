import { oneItemAtATime, validateShowEverything, showEverythingField } from './showEverythingField';
import { describeChaseList } from './describeChaseList';
import { describeSummary } from './describeSummary';
import { getChaseList } from './chaseList';
import { getOwedTasks } from './owedTasks';
import { getWhatCallerOwes } from '$lib/server/owed/callerOwes';
import { withAskers } from './waitingQuestionsFor';
import { objectSchema, readOptionalText } from '../actionTypes';
import { onlyWhatIAskedForField, isNarrowedToOwnAsks } from './chaseScopeField';
import { summaryWalkthrough } from './summaryWalkthrough';
import { titleNameField } from './waitingActions';
import type { McpAction } from '../actionTypes';

const summaryHeading =
	'# What needs you\nYour YBT summary: the information, setup and testing waiting on you, and your to-dos.';

export const summaryActions: McpAction[] = [
	{
		name: 'read_ybt_summary',
		area: 'conversations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the YBT summary — the information, setup and testing waiting on you and your to-dos, ' +
			'across every project, then who to chase, and how to walk the person through them',
		guidance:
			'Left as it is, it gives the one item to raise now, as what_do_i_need_to_do does. With ' +
			'showEverything true, only when the person asks to see everything at once, its answer opens with ' +
			'how to give the summary: information one question at a time, setup as a checklist, testing ' +
			'as one bulk pass, then their to-dos, then who to chase. Building is never listed: it is ' +
			'Claude’s. It holds what list_waiting_on_me holds, by kind, bugs first. Who to chase is read ' +
			'from the same calculation for everyone else on their projects, so it lists exactly what each ' +
			'person’s own summary lists; onlyWhatIAskedFor narrows it to what they asked for.',
		inputSchema: objectSchema({
			name: titleNameField,
			onlyWhatIAskedFor: onlyWhatIAskedForField,
			showEverything: showEverythingField
		}),
		run: async (caller, input) => {
			const isShowingEverything = validateShowEverything(input);
			if (typeof isShowingEverything === 'string') return isShowingEverything;
			if (!isShowingEverything) return oneItemAtATime(caller);
			const owes = await getWhatCallerOwes(caller, readOptionalText(input, 'name'));
			const [waiting, owed, chaseList] = await Promise.all([
				withAskers(caller.supabase, owes.questions),
				getOwedTasks(caller, owes),
				getChaseList(caller, isNarrowedToOwnAsks(input))
			]);
			const summary = describeSummary({ waiting, todos: owes.todos, owed, viewerId: caller.accountId });
			const chase = describeChaseList(chaseList, caller.accountId);
			return [summaryWalkthrough, '', summaryHeading, '', ...summary, '', ...chase].join('\n');
		}
	}
];
