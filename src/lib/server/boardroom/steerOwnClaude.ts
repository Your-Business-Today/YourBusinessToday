import type { SupabaseClient } from '@supabase/supabase-js';
import { findOwnSeatOnMeeting } from './ownSeatOnMeeting';
import { insertSeatSetting, insertSteerNote } from './saveBoardroomSeatControls';
import { settingChangedWords, steerNoteKeptWords } from '$lib/data/describeSeatControls';
import type { RoomCaller } from '$lib/data/placeBoardContribution';
import type { SettingDraft } from '$lib/data/validateSeatControl';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The answer to something a director tells their own Claude, and whether it was kept. */
export type SeatAnswer = { answer: string; isKept: boolean };

/** A director writes their own Claude a note, kept as a new row, which it reads before its next turn. */
export async function steerOwnClaude(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	words: string,
	caller: RoomCaller
): Promise<SeatAnswer> {
	const ownSeat = await findOwnSeatOnMeeting(supabase, organisation.id, meetingId, caller);
	if (typeof ownSeat === 'string') return { answer: ownSeat, isKept: false };
	await insertSteerNote(supabase, ownSeat.placing, words);
	return { answer: steerNoteKeptWords, isKept: true };
}

/** A director pauses or lets go their own Claude, or turns "ask me first" on or off; each change kept as made. */
export async function changeOwnClaudeSetting(
	supabase: SupabaseClient,
	organisation: Organisation,
	meetingId: string,
	change: SettingDraft,
	caller: RoomCaller
): Promise<SeatAnswer> {
	const ownSeat = await findOwnSeatOnMeeting(supabase, organisation.id, meetingId, caller);
	if (typeof ownSeat === 'string') return { answer: ownSeat, isKept: false };
	await insertSeatSetting(supabase, ownSeat.placing, change);
	return { answer: settingChangedWords(change), isKept: true };
}
