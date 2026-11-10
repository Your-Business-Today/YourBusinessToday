import type { SupabaseClient } from '@supabase/supabase-js';
import type { ContextLink, ContextLinkKind } from '$lib/data/companyContext/companyContext';

/** One version's links, told by the keys of the parts at each end. */
export async function readContextLinks(
	supabase: SupabaseClient,
	versionId: string,
	keysById: Map<string, string>
): Promise<ContextLink[]> {
	const { data, error } = await supabase
		.from('company_context_links')
		.select('from_part_id, kind, to_part_id')
		.eq('version_id', versionId);
	if (error) throw error;
	return data.map((row) => ({
		fromKey: keysById.get(String(row.from_part_id)) ?? '',
		kind: String(row.kind) as ContextLinkKind,
		toKey: keysById.get(String(row.to_part_id)) ?? ''
	}));
}
