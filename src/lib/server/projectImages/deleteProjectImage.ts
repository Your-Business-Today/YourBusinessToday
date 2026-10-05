import type { SupabaseClient } from '@supabase/supabase-js';
import { removeAttachmentFiles } from '$lib/server/projects/attachmentFiles';
import type { ProjectImage } from './projectImageRecord';

export async function deleteProjectImage(
	supabase: SupabaseClient,
	image: ProjectImage
): Promise<void> {
	await removeAttachmentFiles(supabase, [image.storagePath]);
	const { error } = await supabase.from('project_images').delete().eq('id', image.id);
	if (error) throw error;
}
