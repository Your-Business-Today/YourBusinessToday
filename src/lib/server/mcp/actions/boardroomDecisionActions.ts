import { boardroomAction } from '../boardroomGate';
import { readText, type McpAction } from '../actionTypes';
import { validateDecisionAnswer } from '$lib/data/validateDecisionAnswer';
import { validateDecisionRule } from '$lib/data/validateDecisionRule';
import { answerBoardDecision } from '$lib/server/boardroom/answerBoardDecision';
import { recordDecisionRule } from '$lib/server/boardroom/recordDecisionRule';
import { boardroomDecisionGuidance } from './boardroomDecisionGuidance';
import { answerDecisionSchema, recordRuleSchema } from './boardroomDecisionFields';

export const boardroomDecisionActions: McpAction[] = [
	boardroomAction({
		name: 'answer_board_decision',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: "record your director's own answer to a decision put to the board: agrees, disagrees or abstains, only as they told you",
		guidance: boardroomDecisionGuidance.answer,
		inputSchema: answerDecisionSchema,
		run: async (caller, input, organisation) => {
			const draft = validateDecisionAnswer(input);
			if (typeof draft === 'string') return draft;
			const director = { accountId: caller.accountId, now: new Date() };
			const answered = await answerBoardDecision(caller.supabase, organisation, readText(input, 'meetingId'), draft, director);
			return answered.answer;
		}
	}),
	boardroomAction({
		name: 'record_board_decision_rule',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: "record how the company's own articles say its directors' decisions carry, where they differ from the model articles",
		guidance: boardroomDecisionGuidance.recordRule,
		inputSchema: recordRuleSchema,
		run: async (caller, input, organisation) => {
			const rule = validateDecisionRule(input);
			if (typeof rule === 'string') return rule;
			return recordDecisionRule(caller.supabase, organisation, rule, { accountId: caller.accountId, now: new Date() });
		}
	})
];
