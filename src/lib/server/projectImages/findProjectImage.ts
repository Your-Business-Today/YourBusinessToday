import type { SupabaseClient } from '@supabase/supabase-js';
import { isUuid } from '$lib/data/isUuid';
import { parseProjectImageRecord, type ProjectImage } from './projectImageRecord';

export async function findProjectImage(
	supabase: SupabaseClient,
	projectId: string,
	imageId: string
): Promise<ProjectImage | null> {
	if (!isUuid(imageId)) return null;
	const { data, error } = await supabase
		.from('project_images')
		.select('*')
		.eq('id', imageId)
		.eq('project_id', projectId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseProjectImageRecord(data);
}
