import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { BoardroomMeeting } from '$lib/data/boardroomMeeting';
import type { DirectorTurn } from '$lib/data/boardroomTurnCalls';

const turnCallsTable = 'boardroom_turn_calls';
const turnCallKey = 'agenda_item_id,director_id,round';

function keyOfTurn(turn: DirectorTurn): string {
	const { item } = turn;
	return `${item.id} ${turn.seatId} ${turn.round}`;
}

function keyOfRow(row: Record<string, unknown>): string {
	return `${row.agenda_item_id} ${row.director_id} ${row.round}`;
}

function rowOfTurn(meeting: BoardroomMeeting, turn: DirectorTurn) {
	const { item } = turn;
	return { agenda_item_id: item.id, director_id: turn.seatId, round: turn.round, organisation_id: meeting.organisationId, meeting_id: meeting.id };
}

/**
 * Keeps a call for each turn not called before, and gives back only those: a turn already called is left as it was,
 * so its director is never emailed for it twice. Nothing is called until the table exists.
 */
export async function insertNewTurnCalls(supabase: SupabaseClient, meeting: BoardroomMeeting, turns: DirectorTurn[]): Promise<DirectorTurn[]> {
	if (turns.length === 0) return [];
	const rows = turns.map((turn) => rowOfTurn(meeting, turn));
	const inserting = supabase.from(turnCallsTable).upsert(rows, { onConflict: turnCallKey, ignoreDuplicates: true });
	const { data, error } = await inserting.select(turnCallKey);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	const newKeys = new Set((data ?? []).map(keyOfRow));
	return turns.filter((turn) => newKeys.has(keyOfTurn(turn)));
}
