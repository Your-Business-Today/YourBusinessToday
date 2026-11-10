import { describe, expect, it, vi } from 'vitest';
import { readItemInTheRoom } from './readItemInTheRoom';
import { serviceRoleBriefTable } from './boardroomBriefTable.fixtures';
import { meetingInRoom, said } from '$lib/data/boardroomRoom.fixtures';
import { duringTheMeeting, jeremysSeat, meetingId, nigelsSeat, yourBusinessToday } from '$lib/data/boardroomMeeting.fixtures';
import { jeremysBrief, nigelsSecondBrief } from '$lib/data/boardroomBrief.fixtures';

const inRoom = vi.hoisted(() => ({ said: [] as unknown[] }));
vi.mock('./getMeetingsOfOrganisation', async () => {
	const { meetingInRoom: record } = await import('$lib/data/boardroomRoom.fixtures');
	const { meeting, items } = record();
	return { getBoardroomMeeting: async () => meeting, getAgendaItemsOfMeetings: async () => items };
});
vi.mock('./getDirectorsOfOrganisation', () => ({ getDirectorsOfOrganisation: async () => [nigelsSeat, jeremysSeat] }));
vi.mock('./getBoardroomPapers', () => ({ getKeptPapersOfMeeting: async () => [] }));
vi.mock('./getBoardroomRecordPapers', () => ({ getRecordPapersOfMeeting: async () => [] }));
vi.mock('./getBoardroomRoom', () => ({ getRoomOfMeeting: async () => ({ ...meetingInRoom().room, contributions: inRoom.said }) }));

describe('reading an item in the room keeps every brief to its own director', () => {
	it('gives Nigel his own latest brief and what Jeremy’s Claude said, and nothing of Jeremy’s brief', async () => {
		inRoom.said = [said('jeremys-seat', 1, 'comments', { words: 'Jeremy would rather wait.' })];
		const { supabase } = serviceRoleBriefTable();
		const text = await readItemInTheRoom(supabase, yourBusinessToday, meetingId, 1, { accountId: 'nigel', now: duringTheMeeting });
		expect(text).toContain(`Your position: ${nigelsSecondBrief.position}`);
		expect(text).toContain('Jeremy would rather wait.');
		expect(text).toContain('It is your turn');
		expect(text).not.toContain(jeremysBrief.position);
		expect(text).not.toContain(jeremysBrief.mustNotShare);
	});
});
