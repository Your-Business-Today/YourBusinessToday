import { dayOf } from '$lib/data/days';
import { nextTurnText } from '$lib/server/agent/nextTurnText';
import { objectSchema, proseField, textField } from '../actionTypes';
import { readTurnFocus, turnFocusFields } from './turnFocusFields';
import { recordTurnAnswer } from '$lib/server/agent/recordTurnAnswer';
import { turnOutcomeOrder } from '$lib/server/agent/turnOutcome';
import { validateTurnAnswer } from '$lib/server/agent/turnAnswer';
import type { McpAction } from '../actionTypes';

export const answerTurnActions: McpAction[] = [
	{
		name: 'answer_turn',
		area: 'conversations',
		audience: 'everyone',
		isWrite: true,
		summary: 'record the person’s answer to the item next_turn raised, then hand back the next turn',
		guidance:
			'The second half of the YBT agent’s turn. Once the person has answered the item next_turn raised, ' +
			'record it here with its itemKey and the outcome next_turn listed for it, and text in their words: ' +
			'the answer, the promise, what was done, or the proof of a test. A failed test also gives fault, ' +
			'which raises a FIX. snoozed puts it off until untilDay, tomorrow by default; every answer puts its ' +
			'item off until then too, so the next turn moves on. The answer is recorded by the action that owns ' +
			'it (post_message, record_test_results, complete_todo), so their rules hold. Then put the next turn ' +
			'it hands back to the person, one item, never the list.',
		inputSchema: objectSchema(
			{
				itemKey: textField('The item key next_turn gave'),
				outcome: textField(turnOutcomeOrder.join(', ')),
				text: proseField('What the person said: the answer, promise, work done, or proof'),
				fault: textField('For a failed test: what is wrong, in a line'),
				untilDay: textField('The day to raise it again, YYYY-MM-DD; tomorrow when left out'),
				...turnFocusFields
			},
			['itemKey', 'outcome']
		),
		run: async (caller, input) => {
			const now = new Date();
			const answer = validateTurnAnswer(input, dayOf(now.getTime()));
			if (typeof answer === 'string') return answer;
			const focus = readTurnFocus(caller, input);
			if (typeof focus === 'string') return focus;
			const recorded = await recordTurnAnswer(caller, answer, now);
			const next = await nextTurnText(caller, focus, new Date());
			return `${recorded}\n\n${next}`;
		}
	}
];
