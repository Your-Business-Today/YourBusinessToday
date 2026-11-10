import { beforeEach, describe, expect, it, vi } from 'vitest';
import { closeBoardroomMeeting } from './closeBoardroomMeeting';
import { writeBoardroomMinutes } from './writeBoardroomMinutes';
import { answerBoardroomMinutes } from './answerBoardroomMinutes';
import { meetingWithDecision } from '$lib/data/boardroomDecision.fixtures';
import { duringTheMeeting, meetingId, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import { afterTheMeeting, closedMeeting, minutesAnswered, writtenVersion } from '$lib/data/boardroomMinutes.fixtures';
import { boardMinutesRefusals } from '$lib/data/boardroomMinutesRules';
import type { MinutesAnswer, MinutesVersion } from '$lib/data/boardroomMinutes';
import type { MinutesAnswerDraft } from '$lib/data/validateMinutesAnswer';

const board = vi.hoisted(() => ({ isClosed: false, closings: [] as string[], versions: [] as MinutesVersion[], answers: [] as MinutesAnswer[] }));
vi.mock('./readBoardroomMeeting', () => ({
	getMeetingRecord: async () => (board.isClosed ? closedMeeting({ versions: board.versions, answers: board.answers }) : meetingWithDecision())
}));
vi.mock('./saveBoardroomMinutes', () => ({
	insertMeetingClosing: async (_supabase: unknown, placing: { seatId: string }) => {
		board.closings.push(placing.seatId);
		board.isClosed = true;
		return true;
	},
	insertMinutesVersion: async (_supabase: unknown, _placing: unknown, draft: Pick<MinutesVersion, 'version' | 'words' | 'facts'>) => {
		board.versions.push({ ...writtenVersion(draft.version), words: draft.words, facts: draft.facts });
		return true;
	},
	insertMinutesAnswer: async (_supabase: unknown, placing: { seatId: string }, draft: MinutesAnswerDraft) => {
		board.answers.push(minutesAnswered(draft.version, placing.seatId, draft.answer, draft.changeWords));
		return true;
	}
}));

const at = (accountId: string, now = afterTheMeeting) => ({ accountId, now });
const approve = (accountId: string, version: number) =>
	answerBoardroomMinutes({} as never, yourBusinessToday, meetingId, { version, answer: 'approves', changeWords: null }, at(accountId));

describe('the chair closes the meeting, their Claude writes the minutes, and the directors approve them', () => {
	beforeEach(() => {
		board.isClosed = false;
		board.closings = [];
		board.versions = [];
		board.answers = [];
	});

	it('closes only on the chair’s word while an item or a decision still waits', async () => {
		const first = await closeBoardroomMeeting({} as never, yourBusinessToday, meetingId, { isClosingWithItemsWaiting: false }, at('jeremy', duringTheMeeting));
		expect(first.isKept).toBe(false);
		expect(first.answer).toContain('Item 2, Item 2: still in the room');
		expect(board.closings).toEqual([]);
		const second = await closeBoardroomMeeting({} as never, yourBusinessToday, meetingId, { isClosingWithItemsWaiting: true }, at('jeremy', duringTheMeeting));
		expect(second.isKept).toBe(true);
		expect(board.closings).toEqual(['jeremys-seat']);
	});

	it('keeps the chair’s Claude’s words with the facts the service puts in, as version 1', async () => {
		board.isClosed = true;
		const kept = await writeBoardroomMinutes({} as never, yourBusinessToday, meetingId, 'The board talked it through.', at('jeremy'));
		expect(kept).toMatchObject({ isKept: true });
		expect(board.versions).toMatchObject([{ version: 1, words: 'The board talked it through.', facts: { chair: 'Jeremy', closedBy: 'Jeremy' } }]);
		expect(await writeBoardroomMinutes({} as never, yourBusinessToday, meetingId, 'Mine.', at('nigel'))).toMatchObject({
			answer: boardMinutesRefusals.notTheMinuteTaker
		});
	});

	it('approves the minutes once every director on the meeting approves the same version', async () => {
		board.isClosed = true;
		board.versions = [writtenVersion(1)];
		expect((await approve('nigel', 1)).answer).toContain('Still to answer: Jeremy.');
		const last = await approve('jeremy', 1);
		expect(last.answer).toContain('Approved by every director on the meeting. The chair has approved them.');
		expect(await approve('jeremy', 1)).toMatchObject({ isKept: false, answer: boardMinutesRefusals.alreadyAnswered });
	});
});
