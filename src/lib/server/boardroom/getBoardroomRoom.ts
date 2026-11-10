import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import {
	boardContributionColumns,
	boardroomRoomColumns,
	boardroomRoomTables,
	itemOutcomeColumns,
	parseBoardContributionRecord,
	parseBoardroomRoomRecord,
	parseItemOutcomeRecord
} from './boardroomRoomRecord';
import { emptyMeetingRoom, type BoardContribution, type BoardroomRoom, type ItemOutcome, type MeetingRoom } from '$lib/data/boardroomRoom';

async function getRoom(supabase: SupabaseClient, meetingId: string): Promise<BoardroomRoom | null | undefined> {
	const { data, error } = await supabase
		.from(boardroomRoomTables.rooms)
		.select(boardroomRoomColumns)
		.eq('meeting_id', meetingId)
		.maybeSingle();
	if (isSchemaNotYetMigrated(error)) return undefined;
	if (error) throw error;
	return data === null ? null : parseBoardroomRoomRecord(data);
}

async function getContributions(supabase: SupabaseClient, meetingId: string): Promise<BoardContribution[]> {
	const { data, error } = await supabase
		.from(boardroomRoomTables.contributions)
		.select(boardContributionColumns)
		.eq('meeting_id', meetingId)
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map(parseBoardContributionRecord);
}

async function getOutcomes(supabase: SupabaseClient, meetingId: string): Promise<ItemOutcome[]> {
	const { data, error } = await supabase.from(boardroomRoomTables.outcomes).select(itemOutcomeColumns).eq('meeting_id', meetingId);
	if (error) throw error;
	return data.map(parseItemOutcomeRecord);
}

/**
 * Everything said in a meeting's room, which every director of the board reads; empty until the room is
 * opened, and until migration 0185 has run. No brief is ever part of it.
 */
export async function getRoomOfMeeting(supabase: SupabaseClient, meetingId: string): Promise<MeetingRoom> {
	const room = await getRoom(supabase, meetingId);
	if (room === null || room === undefined) return emptyMeetingRoom;
	const [contributions, outcomes] = await Promise.all([getContributions(supabase, meetingId), getOutcomes(supabase, meetingId)]);
	return { room, contributions, outcomes };
}
