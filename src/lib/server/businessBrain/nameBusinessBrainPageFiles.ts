import type { SupabaseClient } from '@supabase/supabase-js';

/** Records that the page was written from these files; a file the page names already is left as it is. */
export async function nameBusinessBrainPageFiles(
	supabase: SupabaseClient,
	page: { organisationId: string; pageId: string },
	fileIds: string[]
): Promise<void> {
	if (fileIds.length === 0) return;
	const rows = fileIds.map((fileId) => ({ organisation_id: page.organisationId, page_id: page.pageId, file_id: fileId }));
	const { error } = await supabase
		.from('business_brain_page_files')
		.upsert(rows, { onConflict: 'page_id,file_id', ignoreDuplicates: true });
	if (error) throw error;
}
