import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgendaRewording } from '$lib/data/validateAgendaChange';

function rewordedColumns(rewording: AgendaRewording): Record<string, unknown> {
	const columns: Record<string, unknown> = {
		changed_at: new Date().toISOString()
	};
	if (rewording.title !== null) columns.title = rewording.title;
	if (rewording.purpose !== null) columns.purpose = rewording.purpose;
	return columns;
}

export async function rewordAgendaItem(
	supabase: SupabaseClient,
	itemId: string,
	rewording: AgendaRewording
): Promise<void> {
	const { error } = await supabase.from('boardroom_agenda_items').update(rewordedColumns(rewording)).eq('id', itemId);
	if (error) throw error;
}

/** Take an item off the agenda before its meeting opens: the row is dated, never deleted. */
export async function withdrawAgendaItem(supabase: SupabaseClient, itemId: string, withdrawnBy: string): Promise<void> {
	const { error } = await supabase
		.from('boardroom_agenda_items')
		.update({
			withdrawn_at: new Date().toISOString(),
			withdrawn_by: withdrawnBy
		})
		.eq('id', itemId)
		.is('withdrawn_at', null);
	if (error) throw error;
}
