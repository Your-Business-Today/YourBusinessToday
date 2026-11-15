import { describeFollowUpsDue } from './describeFollowUps';
import { getFollowUpsDue } from '$lib/server/people/getFollowUpsDue';
import { objectSchema, textField } from '../actionTypes';
import { readDay } from '$lib/data/days';
import { ukClockAt } from '$lib/data/ukClock';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';

export const untilNotADay = 'until is the last day to include, a real day written YYYY-MM-DD, such as 2026-11-20.';

export const followUpActions: McpAction[] = [
	{
		name: 'list_follow_ups_due',
		area: 'clients',
		audience: 'staff',
		isWrite: false,
		summary: 'everyone on the People register whose next step is due, the longest overdue first, with how to reach them and the companies they sit on',
		guidance:
			'Due means the day set on the person with update_person has come: today or earlier, or up to the day you give as until. ' +
			'A next step with no day is never due. Before a follow-up, read_person says what is known and what was last said; ' +
			'after it, log_lead_conversation records how it went and update_person sets the next step and its day.',
		inputSchema: objectSchema({ until: textField('The last day to include, as YYYY-MM-DD; today when left out') }),
		run: async (caller, input) => listFollowUpsDue(caller, input.until)
	}
];

async function listFollowUpsDue(caller: McpCaller, givenUntil: unknown): Promise<string> {
	const { date: today } = ukClockAt(new Date());
	const until = readDay(givenUntil);
	if (until === undefined) return untilNotADay;
	const lastDay = until ?? today;
	return describeFollowUpsDue(await getFollowUpsDue(caller.supabase, lastDay), lastDay, today);
}
