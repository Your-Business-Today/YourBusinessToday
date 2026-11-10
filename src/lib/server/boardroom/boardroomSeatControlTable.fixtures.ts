/**
 * The four tables of migration 0187 as the service role sees them, Nigel's and Jeremy's rows together, the way
 * the connector reads them: only the filters the code asks for stand between one director and the other's.
 */
export function serviceRoleSeatControlTables() {
	const ofSeat = (seat: string, meeting = 'meeting-1') => ({ meeting_id: meeting, director_id: seat });
	const tables: Record<string, Record<string, unknown>[]> = {
		boardroom_steer_notes: [
			{ ...ofSeat('nigels-seat'), id: 'nigels-note', words: 'Push for the loan.', created_at: '2026-11-12T10:01:00.000Z' },
			{ ...ofSeat('jeremys-seat'), id: 'jeremys-note', words: 'Wait for the letter.', created_at: '2026-11-12T10:02:00.000Z' }
		],
		boardroom_seat_settings: [
			{ ...ofSeat('nigels-seat'), id: 'nigels-pause', setting: 'paused', is_on: true, changed_at: '2026-11-12T10:03:00.000Z' }
		],
		boardroom_held_contributions: [
			{ ...ofSeat('nigels-seat'), id: 'nigels-held', agenda_item_id: 'item-1', stance: 'comments', words: 'Hm.', created_at: '2026-11-12T10:04:00.000Z' }
		],
		boardroom_held_contribution_answers: []
	};
	const queriedTables: string[] = [];
	const query = (rows: Record<string, unknown>[]) => {
		const result = Promise.resolve({ data: rows, error: null });
		return Object.assign(result, {
			select: () => query(rows),
			eq: (column: string, value: unknown) => query(rows.filter((row) => row[column] === value))
		});
	};
	const supabase = { from: (table: string) => queriedTables.push(table) && query(tables[table]) };
	return { supabase: supabase as never, queriedTables };
}
