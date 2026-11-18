import type { GrantedUpload } from '$lib/server/storage/recordArrivedUpload';
import type { ProjectVideo } from '$lib/projectVideos/projectVideo';

/** The columns a kept video is read with. */
export const projectVideoColumns =
	'id, project_id, title, description, section, position, duration_seconds, filename, mime_type, byte_count, storage_path, thumbnail_storage_path, captions_storage_path, added_by, recorded_at';

/** The columns a granted upload is read with, whether or not its film has arrived. */
export const videoUploadColumns = 'id, storage_path, thumbnail_storage_path, captions_storage_path, expires_at, recorded_at';

/** A kept video from its row. */
export function parseProjectVideo(row: Record<string, unknown>): ProjectVideo {
	return {
		id: row.id as string,
		projectId: row.project_id as string,
		title: row.title as string,
		description: row.description as string,
		section: row.section as string,
		position: row.position as number,
		durationSeconds: (row.duration_seconds as number | null) ?? null,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		byteCount: row.byte_count as number,
		storagePath: row.storage_path as string,
		thumbnailStoragePath: (row.thumbnail_storage_path as string | null) ?? null,
		captionsStoragePath: (row.captions_storage_path as string | null) ?? null,
		addedBy: (row.added_by as string | null) ?? null,
		recordedAt: row.recorded_at as string
	};
}

/** The upload granted for a video, from its row: its film's grant, and where its thumbnail and captions were to go. */
export type VideoUpload = GrantedUpload & { thumbnailStoragePath: string | null; captionsStoragePath: string | null };

export function parseVideoUpload(row: Record<string, unknown>): VideoUpload {
	return {
		id: row.id as string,
		storagePath: row.storage_path as string,
		thumbnailStoragePath: (row.thumbnail_storage_path as string | null) ?? null,
		captionsStoragePath: (row.captions_storage_path as string | null) ?? null,
		expiresAt: row.expires_at as string,
		recordedAt: (row.recorded_at as string | null) ?? null
	};
}
