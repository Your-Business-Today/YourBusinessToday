import type { SupabaseClient } from '@supabase/supabase-js';
import { safeStorageFilename } from '$lib/server/storage/safeStorageFilename';

/** The private bucket an organisation's exports are kept in (migration 0263). */
export const organisationExportsBucket = 'organisation-data-exports';

/** A download link lasts an hour: long enough to fetch a large export, too short to pass around. */
export const exportLinkLifetimeMinutes = 60;

const secondsInAMinute = 60;
const zipContentType = 'application/zip';

/** Where one part of an export is kept, under its organisation and its export. */
export function exportPartPath(folder: string, partNumber: number): string {
	return `${folder}/part-${partNumber}.zip`;
}

export async function storeExportPart(serviceClient: SupabaseClient, storagePath: string, part: Uint8Array): Promise<void> {
	const { error } = await serviceClient.storage
		.from(organisationExportsBucket)
		.upload(storagePath, part, { contentType: zipContentType });
	if (error !== null) throw error;
}

/** A signed link for each part, downloading as the organisation's name, the day, and which part of how many. */
export async function signExportParts(
	serviceClient: SupabaseClient,
	partPaths: string[],
	downloadName: string
): Promise<string[]> {
	const lifetimeSeconds = exportLinkLifetimeMinutes * secondsInAMinute;
	const partCount = partPaths.length;
	const signing = partPaths.map(async (storagePath, index) => {
		const download = safeStorageFilename(`${downloadName}-part-${index + 1}-of-${partCount}.zip`);
		const { data, error } = await serviceClient.storage
			.from(organisationExportsBucket)
			.createSignedUrl(storagePath, lifetimeSeconds, { download });
		if (error !== null) throw error;
		return data.signedUrl;
	});
	return Promise.all(signing);
}

/**
 * Removes the parts of the organisation's earlier exports, so YBT keeps no more than the latest export's files once
 * a new one is made. The log of every export stays.
 */
export async function removeEarlierExportParts(serviceClient: SupabaseClient, organisationId: string): Promise<void> {
	const bucket = serviceClient.storage.from(organisationExportsBucket);
	const { data: folders, error } = await bucket.list(organisationId);
	if (error !== null) throw error;
	for (const folder of folders) {
		const folderPath = `${organisationId}/${folder.name}`;
		const { data: parts, error: listingError } = await bucket.list(folderPath);
		if (listingError !== null) throw listingError;
		if (parts.length === 0) continue;
		const { error: removalError } = await bucket.remove(parts.map((part) => `${folderPath}/${part.name}`));
		if (removalError !== null) throw removalError;
	}
}
