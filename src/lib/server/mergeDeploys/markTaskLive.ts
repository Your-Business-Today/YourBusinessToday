import type { SupabaseClient } from '@supabase/supabase-js';
import { postMessage } from '$lib/server/conversations/postMessage';
import type { Project } from '$lib/server/projects/projectRecord';

/** Records that a promotion carried the task's staged work live, and tells the task so. */
export async function markTaskLive(
	supabase: SupabaseClient,
	taskId: string,
	project: Project,
	liveAt: string,
	sentence: string
): Promise<void> {
	const { error } = await supabase.from('tasks').update({ live_at: liveAt }).eq('id', taskId);
	if (error) throw error;
	await postMessage(supabase, { taskId }, project.ownerId, sentence);
}
