import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';

/** The private bucket a brand's photos and videos are kept in (migration 0184). */
export const brandLibraryBucket = 'brand-library';

/** Where a brand keeps its photos and videos, and the table each one is granted under. */
export const brandLibraryHome = { bucket: brandLibraryBucket, table: 'brand_library_items' } as const;

/** Where a photo or video is kept: under its organisation, so the brand's library sits together. */
export function brandLibraryStoragePath(organisationId: string, itemId: string, filename: string): string {
	return `${organisationId}/${itemId}/${safeStorageFilename(filename)}`;
}
