import type { SupabaseClient } from '@supabase/supabase-js';
import { brandLibraryBucket } from './brandLibraryStorage';
import { libraryViewLinkLifetimeSeconds } from '$lib/brand/library/libraryLimits';
import type { LibraryItem } from '$lib/brand/library/libraryItem';

/** A kept item with the link the page shows it from. */
export type ViewableLibraryItem = LibraryItem & { viewUrl: string | null };

/** Each item with a signed link to view it by, all signed in one call; an item storage cannot sign shows without one. */
export async function signLibraryViewLinks(supabase: SupabaseClient, items: LibraryItem[]): Promise<ViewableLibraryItem[]> {
	if (items.length === 0) return [];
	const paths = items.map((item) => item.storagePath);
	const { data, error } = await supabase.storage.from(brandLibraryBucket).createSignedUrls(paths, libraryViewLinkLifetimeSeconds);
	if (error !== null) throw error;
	const urlByPath = new Map(data.map((signed) => [signed.path, signed.signedUrl]));
	return items.map((item) => ({ ...item, viewUrl: urlByPath.get(item.storagePath) ?? null }));
}
