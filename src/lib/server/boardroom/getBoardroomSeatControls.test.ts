import { describe, expect, it } from 'vitest';
import { getOwnSeatControls } from './getBoardroomSeatControls';
import { serviceRoleSeatControlTables } from './boardroomSeatControlTable.fixtures';
import { isPaused } from '$lib/data/boardroomSeatControls';
import { agendaItem, calledMeeting, jeremysSeat, nigelsSeat } from '$lib/data/boardroomMeeting.fixtures';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

const record: MeetingRecord = {
	meeting: { ...calledMeeting, id: 'meeting-1' },
	directors: [nigelsSeat, jeremysSeat],
	items: [agendaItem(1)],
	papers: [],
	recordPapers: []
};

describe('what one director has told their own Claude is theirs alone', () => {
	it('gives Jeremy his own note and nothing of Nigel’s note, pause or held piece', async () => {
		const { supabase } = serviceRoleSeatControlTables();
		const controls = await getOwnSeatControls(supabase, record, 'jeremy');
		expect(controls.seatId).toBe('jeremys-seat');
		expect(controls.steerNotes.map((note) => note.id)).toEqual(['jeremys-note']);
		expect(controls.settingChanges).toEqual([]);
		expect(controls.held).toEqual([]);
		expect(isPaused(controls)).toBe(false);
	});

	it('gives Nigel his own, with his pause in force', async () => {
		const { supabase } = serviceRoleSeatControlTables();
		const controls = await getOwnSeatControls(supabase, record, 'nigel');
		expect(controls.steerNotes.map((note) => note.id)).toEqual(['nigels-note']);
		expect(controls.held.map((held) => held.id)).toEqual(['nigels-held']);
		expect(isPaused(controls)).toBe(true);
	});

	it('gives someone with no seat nothing, and never reads the tables for them', async () => {
		const { supabase, queriedTables } = serviceRoleSeatControlTables();
		const controls = await getOwnSeatControls(supabase, record, 'an-administrator');
		expect(controls).toEqual({ seatId: null, steerNotes: [], settingChanges: [], held: [] });
		expect(queriedTables).toEqual([]);
	});
});
