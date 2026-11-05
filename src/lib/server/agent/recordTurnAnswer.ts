import { agendaKey, subjectKinds, type AgendaItem } from './agendaItem';
import { buildAgenda } from './buildAgenda';
import { daysAhead } from '$lib/data/days';
import { outcomeRefusal } from './turnOutcome';
import { recordTurnSpoken, snoozeItem } from './conversationWrites';
import { runAction } from '$lib/server/mcp/runAction';
import { turnDelegation } from './turnDelegation';
import type { McpCaller } from '$lib/server/mcp/resolveMcpCaller';
import type { McpToolAnswer } from '$lib/server/mcp/mcpContent';
import type { TurnAnswer } from './turnAnswer';

const everything = { projectId: null, isBugsOnly: false };

const notOnAgenda =
	'That item is not on this person’s list now: it is done, put off, or the key is wrong. Nothing was recorded. ' +
	'Call next_turn for the item to raise.';

/**
 * Records the answer through the action that owns it, then puts the item off until the day given,
 * or tomorrow, so the next turn moves on rather than raising it again while it is in hand.
 */
export async function recordTurnAnswer(caller: McpCaller, answer: TurnAnswer, now: Date): Promise<string> {
	const { items } = await buildAgenda(caller, everything, now);
	const item = items.find((candidate) => candidate.key === answer.itemKey);
	if (item === undefined) return notOnAgenda;
	const refusal = outcomeRefusal(item.kind, answer.outcome);
	if (refusal !== null) return refusal;
	const delegation = turnDelegation(item, answer);
	if (typeof delegation === 'string') return delegation;
	const said = delegation === null ? '' : answerText(await runAction(caller, delegation.actionName, delegation.input));
	const untilDay = answer.untilDay ?? daysAhead(1, now.getTime());
	await putOff(caller, item, untilDay);
	await recordTurnSpoken(caller.supabase, caller.accountId, item.key, now);
	return [said, `Not raised again before ${untilDay}.`].filter((line) => line !== '').join('\n');
}

async function putOff(caller: McpCaller, item: AgendaItem, untilDay: string): Promise<void> {
	const { supabase, accountId } = caller;
	await snoozeItem(supabase, accountId, item.key, untilDay);
	const { subjectKind, subjectId } = item;
	if (subjectKind !== subjectKinds.task || subjectId === null) return;
	await snoozeItem(supabase, accountId, agendaKey(subjectKinds.task, subjectId), untilDay);
}

function answerText(answer: McpToolAnswer): string {
	if (typeof answer === 'string') return answer;
	return JSON.stringify(answer);
}
