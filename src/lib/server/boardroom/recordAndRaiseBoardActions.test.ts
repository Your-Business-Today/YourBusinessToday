import { beforeEach, describe, expect, it, vi } from 'vitest';
import { recordBoardAction } from './recordBoardAction';
import { raiseActionsWhenAsked, raiseCarriedActions } from './raiseCarriedActions';
import { boardActionRefusals } from '$lib/data/boardroomActionRules';
import { answered, keptDecision, meetingWithDecision } from '$lib/data/boardroomDecision.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import { fileTheAccounts, meetingActions, raisedAs, tellTheBank } from '$lib/data/boardroomAction.fixtures';
import { noSeatControls, type SeatControls } from '$lib/data/boardroomSeatControls';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

const board = vi.hoisted(() => ({
	record: null as unknown as MeetingRecord,
	controls: null as unknown as SeatControls,
	recorded: [] as unknown[],
	keys: new Map<string, string>(),
	made: [] as { madeId: string; what: string }[],
	isMakingFailing: false
}));
vi.mock('./readBoardroomMeeting', () => ({ getMeetingRecord: async () => board.record }));
vi.mock('./getBoardroomSeatControls', () => ({ getControlsOfSeat: async () => board.controls }));
vi.mock('./boardActionWhere', () => ({ boardActionWhere: async () => ({ project: null, owner: { accountId: 'nigel', name: 'Nigel' } }) }));
vi.mock('./saveBoardroomActions', () => ({
	insertBoardAction: async (_supabase: unknown, placing: unknown) => board.recorded.push(placing),
	insertActionRaising: async (_supabase: unknown, key: { actionId: string; madeId: string }) => {
		if (board.keys.has(key.actionId)) return false;
		board.keys.set(key.actionId, key.madeId);
		return true;
	}
}));
vi.mock('./makeRaisedAction', () => ({
	makeRaisedAction: async (_supabase: unknown, _occasion: unknown, toMake: { madeId: string; carried: { action: { what: string } } }) => {
		if (board.isMakingFailing) throw new Error('the board refused it');
		const { madeId, carried } = toMake;
		const { action } = carried;
		board.made.push({ madeId, what: action.what });
	}
}));

const carried = { decisions: [keptDecision()], answers: [answered('nigels-seat', 'agrees'), answered('jeremys-seat', 'agrees')] };
const nigel = { accountId: 'nigel', now: duringTheMeeting };
const draft = { itemNumber: 1, what: 'Tell the bank', owner: 'nigel', dueOn: null, projectId: null, department: null };
const paused: SeatControls = { ...noSeatControls, seatId: 'nigels-seat', settingChanges: [{ id: 'p', setting: 'paused', isOn: true, changedAt: '2026-11-12T10:20:00.000Z' }] };

describe('a director records what the meeting agrees, and it is raised once its decision carries', () => {
	beforeEach(() => {
		board.record = { ...meetingWithDecision(), actions: meetingActions({ actions: [] }) };
		board.controls = noSeatControls;
		board.recorded = [];
		board.keys = new Map();
		board.made = [];
		board.isMakingFailing = false;
	});

	it('records on the page while the director’s Claude is paused, and refuses the paused Claude', async () => {
		board.controls = paused;
		const throughClaude = await recordBoardAction({} as never, yourBusinessToday, meetingId, draft, { ...nigel, isThroughClaude: true });
		expect(throughClaude).toEqual({ answer: boardActionRefusals.claudeHoldsBack, isKept: false });
		const onPage = await recordBoardAction({} as never, yourBusinessToday, meetingId, draft, { ...nigel, isThroughClaude: false });
		expect(onPage.isKept).toBe(true);
		expect(board.recorded).toHaveLength(1);
	});

	it('raises each action of a carried decision once: a second raiser meets the key and stops', async () => {
		board.record = { ...meetingWithDecision(carried), actions: meetingActions() };
		const first = await raiseCarriedActions({} as never, yourBusinessToday, board.record, nigel);
		const second = await raiseCarriedActions({} as never, yourBusinessToday, board.record, nigel);
		expect(board.made.map((made) => made.what)).toEqual([fileTheAccounts.what, tellTheBank.what]);
		expect(first.words).toContain('Raised from the carried decision');
		expect(second.words).toBe('');
	});

	it('says which actions were not raised when making them fails, and never tries again unasked', async () => {
		board.record = { ...meetingWithDecision(carried), actions: meetingActions() };
		board.isMakingFailing = true;
		const failed = await raiseCarriedActions({} as never, yourBusinessToday, board.record, nigel);
		expect(failed.words).toContain('Not raised, because making it failed');
		expect(board.made).toEqual([]);
	});

	it('makes again, on a director’s ask, an action not on its board, with the id its raising holds', async () => {
		const raisings = [raisedAs(fileTheAccounts, 'task-made'), raisedAs(tellTheBank, 'todo-made')];
		board.record = { ...meetingWithDecision(carried), actions: meetingActions({ raisings, standings: { 'task-made': 'Done' } }) };
		const asked = await raiseActionsWhenAsked({} as never, yourBusinessToday, meetingId, nigel);
		expect(asked.isKept).toBe(true);
		expect(board.made).toEqual([{ madeId: 'todo-made', what: tellTheBank.what }]);
		const { keys } = board;
		expect(keys.size).toBe(0);
	});
});
