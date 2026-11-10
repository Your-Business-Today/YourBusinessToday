import type { SupabaseClient } from '@supabase/supabase-js';
import { insertItemOutcome } from './saveBoardroomRoom';
import { emptyMeetingRoom, outcomeOfItem, type ItemOutcome } from '$lib/data/boardroomRoom';
import { settleBoardItem } from '$lib/data/settleBoardItem';
import type { ItemTalk } from '$lib/data/boardroomRoomTurns';
import type { AgendaItem } from '$lib/data/boardroomMeeting';
import type { MeetingRecord } from '$lib/data/describeBoardroomMeeting';

/**
 * How an item has come out of the room: as kept, or kept now when the talk on it has just settled it (every
 * seat agreeing the wording on the table, or every round spent); null while it is still being talked through.
 */
export async function settleBoardroomItem(
	supabase: SupabaseClient,
	record: MeetingRecord,
	item: AgendaItem,
	talk: ItemTalk
): Promise<ItemOutcome | null> {
	const kept = outcomeOfItem(record.room ?? emptyMeetingRoom, item.id);
	if (kept !== null) return kept;
	const settled = settleBoardItem(talk);
	if (settled === null) return null;
	await insertItemOutcome(supabase, record.meeting, item.id, settled);
	return { ...settled, agendaItemId: item.id, reachedAt: new Date().toISOString() };
}
