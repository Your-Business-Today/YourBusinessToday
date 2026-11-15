import type { SupabaseClient } from '@supabase/supabase-js';
import { getMeetingRecord } from './readBoardroomMeeting';
import { getControlsOfSeat } from './getBoardroomSeatControls';
import { insertNewTurnCalls } from './saveBoardroomTurnCalls';
import { emailDirectorsToTheirTurns } from './emailDirectorsToTheirTurns';
import { isPaused } from '$lib/data/boardroomSeatControls';
import { seatsWithTurns, turnsOpenInRoom, type DirectorTurn } from '$lib/data/boardroomTurnCalls';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The turns whose directors have not paused their own Claude; a paused director is not called. */
async function turnsOfUnpausedSeats(supabase: SupabaseClient, meetingId: string, turns: DirectorTurn[]): Promise<DirectorTurn[]> {
	const seatIds = seatsWithTurns(turns);
	const controls = await Promise.all(seatIds.map((seatId) => getControlsOfSeat(supabase, meetingId, seatId)));
	const pausedSeatIds = new Set(controls.filter(isPaused).map((control) => control.seatId));
	return turns.filter((turn) => !pausedSeatIds.has(turn.seatId));
}

async function callEachDirector(supabase: SupabaseClient, organisation: Organisation, meetingId: string, now: Date): Promise<void> {
	const record = await getMeetingRecord(supabase, organisation.id, meetingId);
	if (record === null) return;
	const openTurns = turnsOpenInRoom(record, now);
	const turnsToCall = await turnsOfUnpausedSeats(supabase, meetingId, openTurns);
	const newlyCalled = await insertNewTurnCalls(supabase, record.meeting, turnsToCall);
	await emailDirectorsToTheirTurns(supabase, { organisation, record, turns: newlyCalled });
}

/**
 * Emails each director whose turn has just come: when the room opens, and when a round ends and the next begins.
 * It runs after a piece is kept in the room, so a failure here is logged and never makes what was said look unsaid.
 */
export async function callDirectorsToTheirTurns(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	now: Date
): Promise<void> {
	try {
		await callEachDirector(supabase, organisation, meetingId, now);
	} catch (failure) {
		console.error('Calling directors to their board turns failed', { meetingId, failure });
	}
}
