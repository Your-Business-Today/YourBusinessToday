import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProjectPersonRecord, type ProjectPerson } from './projectPersonRecord';

export async function getPeopleOnProject(
	supabase: SupabaseClient,
	projectId: string
): Promise<ProjectPerson[]> {
	const { data, error } = await supabase.rpc('project_people', { project: projectId });
	if (error) throw error;
	return data.map(parseProjectPersonRecord);
}
