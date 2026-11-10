import { beforeEach, describe, expect, it, vi } from 'vitest';
import { callBoardroomMeeting } from './callBoardroomMeeting';
import { boardroomMeetingRefusals } from '$lib/data/boardroomMeetingRules';
import { formerSeat, jeremysSeat, nigelsSeat, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import type { BoardroomDirector } from '$lib/data/boardroomDirector';

const board = vi.hoisted(() => ({
	directors: [] as BoardroomDirector[],
	meetings: [] as Record<string, unknown>[],
	agendas: [] as unknown[],
	briefed: [] as string[]
}));
const jeremyOnYbt = { id: 'jeremy', name: 'Jeremy', email: 'jeremy@example.com', isManager: false, since: '' };

vi.mock('./getDirectorsOfOrganisation', () => ({ getDirectorsOfOrganisation: async () => board.directors }));
vi.mock('$lib/server/organisations/getMembersOfOrganisation', async (importOriginal) => ({
	...(await importOriginal<object>()),
	getMembersOfOrganisation: async () => [jeremyOnYbt]
}));
vi.mock('./saveBoardroomMeeting', () => ({
	insertBoardroomMeeting: async (_supabase: unknown, calling: Record<string, unknown>) =>
		board.meetings.push(calling) && { id: 'meeting', ...calling },
	insertAgendaItems: async (_supabase: unknown, placing: unknown, drafts: unknown) =>
		board.agendas.push({ placing, drafts })
}));
vi.mock('./addBriefingTodos', () => ({
	addBriefingTodos: async (_occasion: unknown, directors: BoardroomDirector[]) =>
		(board.briefed = directors.map((director) => director.name)).length
}));
vi.mock('./readBoardroomMeeting', () => ({ readBoardroomMeeting: async () => 'the meeting as read' }));

const agenda = [{ title: 'Approve the accounts', purpose: 'decision' as const }];
const now = new Date('2026-11-10T18:00:00Z');

function callMeeting(chair: string | null, accountId = 'nigel') {
	const call = { meetsAt: '2026-11-12T10:00:00.000Z', chair, agenda };
	return callBoardroomMeeting({} as never, yourBusinessToday, call, { accountId, now });
}

describe('a director calls a board meeting', () => {
	beforeEach(() => {
		board.directors = [nigelsSeat, jeremysSeat, formerSeat];
		board.meetings = [];
		board.agendas = [];
		board.briefed = [];
	});

	it('records the meeting with the caller in the chair, its agenda from 1, and briefs every sitting director', async () => {
		const answer = await callMeeting(null);
		expect(board.meetings).toEqual([
			{
				organisationId: 'ybt',
				meetsAt: '2026-11-12T10:00:00.000Z',
				chairDirectorId: 'nigels-seat',
				calledByDirectorId: 'nigels-seat',
				calledBy: 'nigel'
			}
		]);
		const placing = { meetingId: 'meeting', firstPosition: 1, isAnyOtherBusiness: false, addedBy: 'nigel' };
		expect(board.agendas).toEqual([{ placing, drafts: agenda }]);
		expect(board.briefed).toEqual(['Nigel', 'Jeremy']);
		expect(answer).toContain('the meeting as read');
	});

	it('seats the chair named by email', async () => {
		await callMeeting('jeremy@example.com');
		expect(board.meetings[0].chairDirectorId).toBe('jeremys-seat');
	});

	it('refuses a chair who is not a sitting director, recording nothing', async () => {
		expect(await callMeeting('Old')).toBe(boardroomMeetingRefusals.chairNotADirector);
		expect(board.meetings).toEqual([]);
	});

	it('refuses a caller with no seat', async () => {
		expect(await callMeeting(null, 'old')).toBe(boardroomMeetingRefusals.callerHasNoSeat);
		expect(board.meetings).toEqual([]);
	});
});
