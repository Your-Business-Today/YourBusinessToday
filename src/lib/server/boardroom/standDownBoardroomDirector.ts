import type { SupabaseClient } from '@supabase/supabase-js';

/** Date a sitting directorship as ended. The row is kept, so the director's name stays on every meeting they were in. */
export async function standDownBoardroomDirector(
	supabase: SupabaseClient,
	directorId: string,
	stoodDownBy: string
): Promise<void> {
	const { error } = await supabase
		.from('boardroom_directors')
		.update({ stood_down_at: new Date().toISOString(), stood_down_by: stoodDownBy })
		.eq('id', directorId)
		.is('stood_down_at', null);
	if (error) throw error;
}
