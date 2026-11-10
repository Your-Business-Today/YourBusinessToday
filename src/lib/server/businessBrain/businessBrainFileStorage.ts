import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';

/** The private bucket Your Business Brain's source files are kept in (migration 0157). */
export const businessBrainFilesBucket = 'business-brain-files';

/** Where a source file is kept: under its organisation, so the organisation's files sit together. */
export function businessBrainFileStoragePath(organisationId: string, fileId: string, filename: string): string {
	return `${organisationId}/${fileId}/${safeStorageFilename(filename)}`;
}
