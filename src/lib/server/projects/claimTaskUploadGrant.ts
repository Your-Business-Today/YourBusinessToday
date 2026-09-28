import type { SupabaseClient } from '@supabase/supabase-js';

/** Mark the grant recorded — one conditional update, so it is claimed once and only while live. */
export async function claimTaskUploadGrant(
	supabase: SupabaseClient,
	grantId: string
): Promise<boolean> {
	const now = new Date().toISOString();
	const { data, error } = await supabase
		.from('task_upload_grants')
		.update({ recorded_at: now })
		.eq('id', grantId)
		.is('recorded_at', null)
		.gt('expires_at', now)
		.select('id');
	if (error) throw error;
	return data.length > 0;
}
