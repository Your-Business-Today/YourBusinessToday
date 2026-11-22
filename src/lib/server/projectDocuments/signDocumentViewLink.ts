import type { SupabaseClient } from '@supabase/supabase-js';
import { documentViewLinkLifetimeSeconds } from '$lib/projectDocuments/documentViewing';
import { projectDocumentBucket } from './projectDocumentFiles';

/** A signed link that shows a kept document's file in the page, for as long as a reading lasts. */
export async function signDocumentViewLink(supabase: SupabaseClient, storagePath: string): Promise<string> {
	const { data, error } = await supabase.storage.from(projectDocumentBucket).createSignedUrl(storagePath, documentViewLinkLifetimeSeconds);
	if (error !== null) throw error;
	return data.signedUrl;
}
