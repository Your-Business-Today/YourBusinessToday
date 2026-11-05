import { accountNameLookup } from '$lib/data/accountNames';
import { buildAgenda } from '$lib/server/agent/buildAgenda';
import { canReachProject, noReachableProject } from '../projectAccess';
import { describeTurn } from '$lib/server/agent/describeTurn';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { objectSchema, readOptionalText, textField } from '../actionTypes';
import type { McpAction } from '../actionTypes';

const bugsOnlyField = { type: 'boolean', description: 'True to raise only bugs' };

export const nextTurnActions: McpAction[] = [
	{
		name: 'next_turn',
		area: 'conversations',
		audience: 'everyone',
		isWrite: false,
		summary:
			'the one thing to raise with the person now, bugs first, with why it matters and what a good answer looks like',
		guidance:
			'The YBT agent works one item per turn. Call it when the person asks what they need to do, what is ' +
			'on, or carries on a conversation about their work; again after each answer is recorded. It is ' +
			'worked out fresh from the board, so the same board gives the same item however the chat started. ' +
			'Put that one item to the person in a sentence or two, never the whole list. projectId or bugsOnly ' +
			'narrow it when they ask to talk about one project or only bugs. whats_outstanding_for_me is for ' +
			'"show me everything".',
		inputSchema: objectSchema({
			projectId: textField('Talk only about this project, as list_projects gives it'),
			bugsOnly: bugsOnlyField
		}),
		run: async (caller, input) => {
			const projectId = readOptionalText(input, 'projectId');
			if (projectId !== null && !canReachProject(caller, projectId)) return noReachableProject;
			const isBugsOnly = input.bugsOnly === true || input.bugsOnly === 'true';
			const now = new Date();
			const agenda = await buildAgenda(caller, { projectId, isBugsOnly }, now);
			const askerIds = agenda.items.flatMap((item) => item.askedById ?? []);
			const nameOf = accountNameLookup(await getAccountsById(caller.supabase, askerIds));
			return describeTurn({ agenda, nameOf, now }).join('\n');
		}
	}
];
