import type { SupabaseClient } from '@supabase/supabase-js';
import { parseProjectImageRecord, type ProjectImage } from './projectImageRecord';

export async function getProjectImages(
	supabase: SupabaseClient,
	projectId: string
): Promise<ProjectImage[]> {
	const { data, error } = await supabase
		.from('project_images')
		.select('*')
		.eq('project_id', projectId)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data.map(parseProjectImageRecord);
}

export async function getProjectImagePaths(
	supabase: SupabaseClient,
	projectId: string
): Promise<string[]> {
	const images = await getProjectImages(supabase, projectId);
	return images.map((image) => image.storagePath);
}
