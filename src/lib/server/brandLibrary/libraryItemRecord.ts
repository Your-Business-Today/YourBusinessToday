import type { GrantedUpload } from '$lib/server/storage/recordArrivedUpload';
import type { LibraryItem, PostingFooting } from '$lib/brand/library/libraryItem';

/** The columns a kept item is read with. */
export const libraryItemColumns =
	'id, filename, mime_type, byte_count, storage_path, shows, taken_on, posting, permission_given_by, added_by, recorded_at';

/** A kept photo or video from its row. */
export function parseLibraryItem(row: Record<string, unknown>): LibraryItem {
	return {
		id: row.id as string,
		filename: row.filename as string,
		mimeType: row.mime_type as string,
		byteCount: row.byte_count as number,
		storagePath: row.storage_path as string,
		shows: row.shows as string,
		takenOn: row.taken_on as string,
		posting: row.posting as PostingFooting,
		permissionGivenBy: (row.permission_given_by as string | null) ?? null,
		addedBy: (row.added_by as string | null) ?? null,
		recordedAt: row.recorded_at as string
	};
}

/** The upload granted for an item, from its row, whether or not its file has arrived. */
export function parseLibraryUpload(row: Record<string, unknown>): GrantedUpload & { filename: string } {
	return {
		id: row.id as string,
		filename: row.filename as string,
		storagePath: row.storage_path as string,
		expiresAt: row.expires_at as string,
		recordedAt: (row.recorded_at as string | null) ?? null
	};
}
