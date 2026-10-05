import type { SupabaseClient } from '@supabase/supabase-js';
import { projectImageStoragePath } from './projectImageStorage';
import { signUploadUrl } from '$lib/server/projects/storageUploads';

export type ProjectImageUploadGrant = { imageId: string; uploadUrl: string };

export async function grantProjectImageUpload(
	supabase: SupabaseClient,
	projectId: string,
	filename: string
): Promise<ProjectImageUploadGrant> {
	const imageId = crypto.randomUUID();
	const storagePath = projectImageStoragePath(projectId, imageId, filename);
	return { imageId, uploadUrl: await signUploadUrl(supabase, storagePath) };
}
