import type { SupabaseClient } from '@supabase/supabase-js';
import { VideoLimits } from '$lib/projectVideos/videoLimits';
import { parseProjectVideo, parseVideoUpload, projectVideoColumns, videoUploadColumns, type VideoUpload } from './projectVideoRecord';
import type { ProjectVideo } from '$lib/projectVideos/projectVideo';
import type { VideoAdder } from './videoAdder';
import type { VideoLibrary } from '$lib/projectVideos/videoLibraries';

const lastListedRow = VideoLimits.mostVideosListed - 1;

/** The project's video with that id, if its upload was granted to this person, whether or not its film has arrived. */
export async function findVideoUpload(supabase: SupabaseClient, adder: VideoAdder, videoId: string): Promise<VideoUpload | null> {
	const { data, error } = await supabase
		.from('project_videos')
		.select(videoUploadColumns)
		.eq('id', videoId)
		.eq('project_id', adder.projectId)
		.eq('added_by', adder.accountId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseVideoUpload(data);
}

/** The project's video with that id once its film has arrived; one still awaited is not in the library yet. */
export async function findKeptVideo(supabase: SupabaseClient, projectId: string, videoId: string): Promise<ProjectVideo | null> {
	const { data, error } = await supabase
		.from('project_videos')
		.select(projectVideoColumns)
		.eq('id', videoId)
		.eq('project_id', projectId)
		.not('recorded_at', 'is', null)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseProjectVideo(data);
}

/** The project's kept videos in the order they are watched, as many as the library shows: one library's, or both when none is named. */
export async function readKeptVideos(supabase: SupabaseClient, projectId: string, library?: VideoLibrary): Promise<ProjectVideo[]> {
	const kept = supabase.from('project_videos').select(projectVideoColumns).eq('project_id', projectId).not('recorded_at', 'is', null);
	const inLibrary = library === undefined ? kept : kept.eq('library', library);
	const { data, error } = await inLibrary
		.order('position', { ascending: true })
		.order('title', { ascending: true })
		.range(0, lastListedRow);
	if (error) throw error;
	return (data ?? []).map(parseProjectVideo);
}
