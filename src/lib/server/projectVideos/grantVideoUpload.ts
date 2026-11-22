import type { SupabaseClient } from '@supabase/supabase-js';
import { projectVideoBucket, videoCaptionsPath, videoFilmPath, videoThumbnailPath } from './projectVideoStorage';
import { signUploadLink } from '$lib/server/storage/signUploadLink';
import { videoUploadLinkLifetimeHours } from '$lib/projectVideos/videoLimits';
import type { GrantedVideoUpload } from './grantedVideoUpload';
import type { VideoAdder } from './videoAdder';
import type { VideoFileGiven, VideoGiven } from '$lib/projectVideos/projectVideo';

type GrantPaths = { videoId: string; filmPath: string; thumbnailPath: string | null; captionsPath: string | null };

type PathMaker = (projectId: string, videoId: string, filename: string) => string;

const millisecondsInAnHour = 60 * 60 * 1000;

/**
 * Keeps the video as described, waiting for its film, then opens the signed links its files are sent
 * to. The row comes first, because storage lets a person send only to a path granted to them.
 */
export async function grantVideoUpload(supabase: SupabaseClient, adder: VideoAdder, video: VideoGiven): Promise<GrantedVideoUpload> {
	const videoId = crypto.randomUUID();
	const { film, thumbnail, captions } = video;
	const paths = {
		videoId,
		filmPath: videoFilmPath(adder.projectId, videoId, film.filename),
		thumbnailPath: companionPath(adder, videoId, thumbnail, videoThumbnailPath),
		captionsPath: companionPath(adder, videoId, captions, videoCaptionsPath)
	};
	const { error } = await supabase.from('project_videos').insert(grantRow(adder, video, paths));
	if (error !== null) throw error;
	return {
		videoId,
		filmUploadUrl: await signUploadLink(supabase, projectVideoBucket, paths.filmPath),
		thumbnailUploadUrl: paths.thumbnailPath === null ? null : await signUploadLink(supabase, projectVideoBucket, paths.thumbnailPath),
		captionsUploadUrl: paths.captionsPath === null ? null : await signUploadLink(supabase, projectVideoBucket, paths.captionsPath)
	};
}

function companionPath(adder: VideoAdder, videoId: string, file: VideoFileGiven | null, pathOf: PathMaker): string | null {
	if (file === null) return null;
	return pathOf(adder.projectId, videoId, file.filename);
}

function grantRow(adder: VideoAdder, video: VideoGiven, paths: GrantPaths): Record<string, unknown> {
	const { details, film } = video;
	return {
		id: paths.videoId,
		project_id: adder.projectId,
		title: details.title,
		description: details.description,
		section: details.section,
		position: details.position,
		duration_seconds: details.durationSeconds,
		library: details.library,
		filename: film.filename,
		mime_type: film.mimeType,
		storage_path: paths.filmPath,
		thumbnail_storage_path: paths.thumbnailPath,
		captions_storage_path: paths.captionsPath,
		added_by: adder.accountId,
		expires_at: new Date(Date.now() + videoUploadLinkLifetimeHours * millisecondsInAnHour).toISOString()
	};
}
