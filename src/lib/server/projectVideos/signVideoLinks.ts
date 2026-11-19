import type { SupabaseClient } from '@supabase/supabase-js';
import { projectVideoBucket, storedFilesOf } from './projectVideoStorage';
import { videoViewLinkLifetimeSeconds } from '$lib/projectVideos/videoLimits';
import type { ProjectVideo, WatchableVideo } from '$lib/projectVideos/projectVideo';

/** Each video with signed links to play its film, show its thumbnail and read its captions, all signed in one call; a file storage cannot sign goes without. */
export async function signVideoLinks(supabase: SupabaseClient, videos: ProjectVideo[]): Promise<WatchableVideo[]> {
	if (videos.length === 0) return [];
	const { data, error } = await supabase.storage.from(projectVideoBucket).createSignedUrls(videos.flatMap(storedFilesOf), videoViewLinkLifetimeSeconds);
	if (error !== null) throw error;
	const urlByPath = new Map(data.map((signed) => [signed.path, signed.signedUrl]));
	const linkTo = (path: string | null) => (path === null ? null : (urlByPath.get(path) ?? null));
	return videos.map((video) => ({
		...video,
		filmUrl: linkTo(video.storagePath),
		thumbnailUrl: linkTo(video.thumbnailStoragePath),
		captionsUrl: linkTo(video.captionsStoragePath)
	}));
}
