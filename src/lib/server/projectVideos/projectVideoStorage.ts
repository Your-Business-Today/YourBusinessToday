import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';
import type { ProjectVideo } from '$lib/projectVideos/projectVideo';

/** The private bucket a project's tutorial videos and their thumbnails are kept in (migration 0266). */
export const projectVideoBucket = 'project-videos';

/** Where a project's videos are kept, and the table each one is granted under. */
export const projectVideoHome = { bucket: projectVideoBucket, table: 'project_videos' } as const;

/** Where a video's film is kept: under its project and its own id, so a project's library sits together. */
export function videoFilmPath(projectId: string, videoId: string, filename: string): string {
	return `${projectId}/${videoId}/${safeStorageFilename(filename)}`;
}

/** Where a video's thumbnail is kept: beside its film, under a name of its own. */
export function videoThumbnailPath(projectId: string, videoId: string, filename: string): string {
	return `${projectId}/${videoId}/thumbnail-${safeStorageFilename(filename)}`;
}

/** Where a video's captions are kept: beside its film, under a name of its own. */
export function videoCaptionsPath(projectId: string, videoId: string, filename: string): string {
	return `${projectId}/${videoId}/captions-${safeStorageFilename(filename)}`;
}

/** Every file a video keeps: its film, and its thumbnail and captions where it has them. */
export function storedFilesOf(video: ProjectVideo): string[] {
	const companions = [video.thumbnailStoragePath, video.captionsStoragePath].filter((path): path is string => path !== null);
	return [video.storagePath, ...companions];
}
