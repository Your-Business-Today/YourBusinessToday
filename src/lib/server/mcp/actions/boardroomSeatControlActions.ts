import { boardroomAction } from '../boardroomGate';
import { readText, type McpAction } from '../actionTypes';
import { validateHeldAnswer, validateSeatSetting, validateSteerNote } from '$lib/data/validateSeatControl';
import { answerHeldContribution } from '$lib/server/boardroom/answerHeldContribution';
import { changeOwnClaudeSetting, steerOwnClaude } from '$lib/server/boardroom/steerOwnClaude';
import { boardroomSeatControlGuidance } from './boardroomSeatControlGuidance';
import { heldAnswerSchema, settingSchema, steerSchema } from './boardroomSeatControlFields';

export const boardroomSeatControlActions: McpAction[] = [
	boardroomAction({
		name: 'steer_own_claude',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: 'keep a note from your own director for the meeting, which you read before your next turn in the room',
		guidance: boardroomSeatControlGuidance.steer,
		inputSchema: steerSchema,
		run: async (caller, input, organisation) => {
			const note = validateSteerNote(input);
			if (typeof note === 'string') return note;
			const director = { accountId: caller.accountId, now: new Date() };
			const steered = await steerOwnClaude(caller.supabase, organisation, readText(input, 'meetingId'), note.words, director);
			return steered.answer;
		}
	}),
	boardroomAction({
		name: 'change_own_claude_setting',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: 'on your own director’s word: pause yourself in the room or go on again, or start or stop asking them first before each piece',
		guidance: boardroomSeatControlGuidance.setting,
		inputSchema: settingSchema,
		run: async (caller, input, organisation) => {
			const change = validateSeatSetting(input);
			if (typeof change === 'string') return change;
			const director = { accountId: caller.accountId, now: new Date() };
			const changed = await changeOwnClaudeSetting(caller.supabase, organisation, readText(input, 'meetingId'), change, director);
			return changed.answer;
		}
	}),
	boardroomAction({
		name: 'answer_held_contribution',
		area: 'boardroom',
		audience: 'everyone',
		isWrite: true,
		summary: 'record your own director’s answer to a piece you held for them: yes says it in the room, no keeps it unsaid',
		guidance: boardroomSeatControlGuidance.answerHeld,
		inputSchema: heldAnswerSchema,
		run: async (caller, input, organisation) => {
			const draft = validateHeldAnswer(input);
			if (typeof draft === 'string') return draft;
			const director = { accountId: caller.accountId, now: new Date() };
			const answered = await answerHeldContribution(caller.supabase, organisation, readText(input, 'meetingId'), draft, director);
			return answered.answer;
		}
	})
];
