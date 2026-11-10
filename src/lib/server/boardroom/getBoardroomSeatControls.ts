import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import {
	heldAnswerColumns,
	heldContributionColumns,
	parseHeldAnswerKind,
	parseHeldContributionRecord,
	parseSeatSettingRecord,
	parseSteerNoteRecord,
	seatControlTables,
	seatSettingColumns,
	steerNoteColumns
} from './boardroomSeatControlRecord';
import { sittingSeatOf } from '$lib/data/boardroomDirector';
import { noSeatControls, type HeldAnswerKind, type SeatControls } from '$lib/data/boardroomSeatControls';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

type SeatRows = { data: Record<string, unknown>[] | null; error: { code?: string; message?: string } | null };

async function rowsOfSeat(supabase: SupabaseClient, table: string, columns: string, place: { meetingId: string; seatId: string }) {
	const query = supabase.from(table).select(columns).eq('meeting_id', place.meetingId).eq('director_id', place.seatId);
	const { data, error } = (await query) as SeatRows;
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data ?? [];
}

function answersById(rows: Record<string, unknown>[]): Map<string, HeldAnswerKind> {
	return new Map(rows.map((row) => [row.held_id as string, parseHeldAnswerKind(row)]));
}

/**
 * One seat's own notes, settings and held pieces on one meeting. The site's client is held to them by row-level
 * security; the connector's service client is held to them by the seat named here, so nobody reads another's.
 */
export async function getControlsOfSeat(supabase: SupabaseClient, meetingId: string, seatId: string): Promise<SeatControls> {
	const place = { meetingId, seatId };
	const [notes, settings, held, answers] = await Promise.all([
		rowsOfSeat(supabase, seatControlTables.steerNotes, steerNoteColumns, place),
		rowsOfSeat(supabase, seatControlTables.settings, seatSettingColumns, place),
		rowsOfSeat(supabase, seatControlTables.held, heldContributionColumns, place),
		rowsOfSeat(supabase, seatControlTables.answers, heldAnswerColumns, place)
	]);
	const answered = answersById(answers);
	return {
		seatId,
		steerNotes: notes.map(parseSteerNoteRecord),
		settingChanges: settings.map(parseSeatSettingRecord),
		held: held.map((row) => parseHeldContributionRecord(row, answered.get(row.id as string) ?? null))
	};
}

/** What one reader of a meeting has told their own Claude on it; nothing at all when they hold no seat. */
export async function getOwnSeatControls(supabase: SupabaseClient, record: MeetingRecord, accountId: string): Promise<SeatControls> {
	const seat = sittingSeatOf(record.directors, accountId);
	if (seat === null) return noSeatControls;
	return getControlsOfSeat(supabase, record.meeting.id, seat.id);
}
