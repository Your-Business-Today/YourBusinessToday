import type { SupabaseClient } from '@supabase/supabase-js';
import { parseUploadGrantRecord, type TaskUploadGrant } from './uploadGrantRecord';

/** The grant with that id on that task, if it was granted to this person. */
export async function findTaskUploadGrant(
	supabase: SupabaseClient,
	taskId: string,
	grantId: string,
	grantedTo: string
): Promise<TaskUploadGrant | null> {
	const { data, error } = await supabase
		.from('task_upload_grants')
		.select('*')
		.eq('id', grantId)
		.eq('task_id', taskId)
		.eq('granted_to', grantedTo)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseUploadGrantRecord(data);
}
