import type { SupabaseClient } from '@supabase/supabase-js';
import { findVideoUpload } from './findProjectVideos';
import { measureStoredFile } from '$lib/server/storage/measureStoredFile';
import { projectVideoBucket, projectVideoHome } from './projectVideoStorage';
import { recordArrivedUpload, uploadRecordings } from '$lib/server/storage/recordArrivedUpload';
import type { VideoAdder } from './videoAdder';
import type { VideoUploadRecording } from './videoUploadRecording';

const companionColumns = { thumbnail: 'thumbnail_storage_path', captions: 'captions_storage_path' } as const;

/**
 * Keeps the film that arrived at a link this person was granted, at the size that arrived. A thumbnail
 * or captions granted with it that never came are let go: the page shows the film's first frame, and no captions.
 */
export async function recordVideoUpload(supabase: SupabaseClient, adder: VideoAdder, videoId: string): Promise<VideoUploadRecording> {
	const upload = await findVideoUpload(supabase, adder, videoId);
	if (upload === null) return { status: 'not_granted' };
	const recording = await recordArrivedUpload(supabase, projectVideoHome, upload);
	if (recording.status !== uploadRecordings.recorded) return recording;
	const hasThumbnail = await keepCompanionIfArrived(supabase, upload.id, upload.thumbnailStoragePath, companionColumns.thumbnail);
	const hasCaptions = await keepCompanionIfArrived(supabase, upload.id, upload.captionsStoragePath, companionColumns.captions);
	return { ...recording, library: upload.library, hasThumbnail, hasCaptions };
}

async function keepCompanionIfArrived(supabase: SupabaseClient, videoId: string, storagePath: string | null, column: string): Promise<boolean> {
	if (storagePath === null) return false;
	const byteCount = await measureStoredFile(supabase, projectVideoBucket, storagePath);
	if (byteCount !== null) return true;
	const { error } = await supabase.from('project_videos').update({ [column]: null }).eq('id', videoId);
	if (error !== null) throw error;
	return false;
}
