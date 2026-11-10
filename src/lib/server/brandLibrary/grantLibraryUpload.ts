import type { SupabaseClient } from '@supabase/supabase-js';
import { brandLibraryBucket, brandLibraryStoragePath } from './brandLibraryStorage';
import { libraryUploadLinkLifetimeHours } from '$lib/brand/library/libraryLimits';
import type { LibraryItemGiven } from '$lib/brand/library/libraryItem';

/** The link a photo or video is sent to, and the id it is kept under once it arrives. */
export type GrantedLibraryUpload = { itemId: string; uploadUrl: string };

/** Who is adding the item, and to which organisation's brand. */
export type LibraryAdder = { organisationId: string; accountId: string };

const millisecondsInAnHour = 60 * 60 * 1000;

/**
 * Keeps the item as described, waiting for its file, then opens the signed link the file is sent
 * to. The row comes first, because storage lets a person send only to a path granted to them.
 */
export async function grantLibraryUpload(supabase: SupabaseClient, adder: LibraryAdder, item: LibraryItemGiven): Promise<GrantedLibraryUpload> {
	const itemId = crypto.randomUUID();
	const storagePath = brandLibraryStoragePath(adder.organisationId, itemId, item.filename);
	const expiresAt = new Date(Date.now() + libraryUploadLinkLifetimeHours * millisecondsInAnHour).toISOString();
	const row = {
		id: itemId,
		organisation_id: adder.organisationId,
		filename: item.filename,
		mime_type: item.mimeType,
		storage_path: storagePath,
		shows: item.shows,
		taken_on: item.takenOn,
		posting: item.posting,
		permission_given_by: item.permissionGivenBy,
		added_by: adder.accountId,
		expires_at: expiresAt
	};
	const { error } = await supabase.from('brand_library_items').insert(row);
	if (error !== null) throw error;
	const { data: signed, error: signingError } = await supabase.storage.from(brandLibraryBucket).createSignedUploadUrl(storagePath);
	if (signingError !== null) throw signingError;
	return { itemId, uploadUrl: signed.signedUrl };
}
