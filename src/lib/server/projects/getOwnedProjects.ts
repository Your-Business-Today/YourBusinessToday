import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProjectRecord, type Project } from '$lib/server/projects/projectRecord';

/** The projects an owner owns, in the order of their projects board. */
export async function getOwnedProjects(supabase: SupabaseClient, ownerId: string): Promise<Project[]> {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.eq('owner_id', ownerId)
		.order('priority', { ascending: true })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map(parseProjectRecord);
}
