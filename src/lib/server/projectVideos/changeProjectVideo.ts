import type { SupabaseClient } from '@supabase/supabase-js';
import { projectVideoBucket, storedFilesOf } from './projectVideoStorage';
import type { ProjectVideo, VideoDetails } from '$lib/projectVideos/projectVideo';

const columnOfDetail: Record<keyof VideoDetails, string> = {
	title: 'title',
	description: 'description',
	section: 'section',
	position: 'position',
	durationSeconds: 'duration_seconds',
	library: 'library'
};

/** Changes the details named on a kept video of the project. */
export async function changeVideoDetails(supabase: SupabaseClient, video: ProjectVideo, changes: Partial<VideoDetails>): Promise<void> {
	const row = Object.fromEntries(Object.entries(changes).map(([detail, value]) => [columnOfDetail[detail as keyof VideoDetails], value]));
	const { error } = await supabase.from('project_videos').update(row).eq('id', video.id).eq('project_id', video.projectId);
	if (error !== null) throw error;
}

/** Takes a video out of the project's library: its files first, so nothing is left in storage that no row names, then its row. */
export async function removeProjectVideo(supabase: SupabaseClient, video: ProjectVideo): Promise<void> {
	const { error: storageError } = await supabase.storage.from(projectVideoBucket).remove(storedFilesOf(video));
	if (storageError !== null) throw storageError;
	const { error } = await supabase.from('project_videos').delete().eq('id', video.id).eq('project_id', video.projectId);
	if (error !== null) throw error;
}
