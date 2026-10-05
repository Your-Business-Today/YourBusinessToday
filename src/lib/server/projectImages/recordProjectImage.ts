import type { SupabaseClient } from '@supabase/supabase-js';
import { isFileStored } from '$lib/server/projects/storageUploads';
import { projectImageStoragePath } from './projectImageStorage';
import type { AttachmentRecording } from '$lib/server/projects/recordTaskAttachment';
import type { AttachmentUpload } from '$lib/server/projects/attachmentRecord';

export type NewProjectImage = {
	projectId: string;
	imageId: string;
	uploadedBy: string;
	upload: AttachmentUpload;
};

export async function recordProjectImage(
	supabase: SupabaseClient,
	{ projectId, imageId, uploadedBy, upload }: NewProjectImage
): Promise<AttachmentRecording> {
	const storagePath = projectImageStoragePath(projectId, imageId, upload.filename);
	const isStored = await isFileStored(supabase, storagePath);
	if (!isStored) return 'file_missing';
	const { error } = await supabase.from('project_images').insert({
		id: imageId,
		project_id: projectId,
		filename: upload.filename,
		mime_type: upload.mimeType,
		byte_count: upload.byteCount,
		storage_path: storagePath,
		uploaded_by: uploadedBy
	});
	if (error !== null) throw error;
	return 'recorded';
}
