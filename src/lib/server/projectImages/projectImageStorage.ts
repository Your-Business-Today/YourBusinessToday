import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';

export function projectImageStoragePath(
	projectId: string,
	imageId: string,
	filename: string
): string {
	return `projects/${projectId}/images/${imageId}/${safeStorageFilename(filename)}`;
}
