import type { SupabaseClient } from '@supabase/supabase-js';

const notFoundTable = 'postcodes_not_found';

/** Kept with when they were asked, so the list of postcodes still to place leaves them out for a while and never stalls behind them. */
export async function rememberPostcodesNotFound(supabase: SupabaseClient, postcodes: string[]): Promise<void> {
	if (postcodes.length === 0) return;
	const askedAt = new Date().toISOString();
	const rows = postcodes.map((postcode) => ({ postcode, asked_at: askedAt }));
	const { error } = await supabase.from(notFoundTable).upsert(rows, { onConflict: 'postcode' });
	if (error) throw error;
}
