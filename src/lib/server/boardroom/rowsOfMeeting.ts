import type { SupabaseClient } from '@supabase/supabase-js';

/** Every row of a board table that belongs to one meeting. */
export async function rowsOfMeeting(supabase: SupabaseClient, table: string, columns: string, meetingId: string) {
	const { data, error } = await supabase.from(table).select(columns).eq('meeting_id', meetingId);
	if (error) throw error;
	return (data ?? []) as unknown as Record<string, unknown>[];
}
