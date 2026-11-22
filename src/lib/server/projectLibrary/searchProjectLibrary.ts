import type { SupabaseClient } from '@supabase/supabase-js';
import { LibrarySearchLimits, type LibraryMatch, type LibraryMatchKind } from '$lib/projectLibrary/libraryMatch';
import { excerptPartsOf } from '$lib/projectLibrary/libraryExcerpt';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { VideoLibrary } from '$lib/projectVideos/videoLibraries';

type SearchRow = {
	kind: LibraryMatchKind;
	item_id: string;
	title: string;
	summary: string;
	section: string;
	library: VideoLibrary | null;
	excerpt: string;
};

/**
 * The project's videos and documents that match the words, best first, as search_project_library (migration 0269)
 * ranks them; null while that migration has not run yet.
 */
export async function searchProjectLibrary(supabase: SupabaseClient, projectId: string, words: string): Promise<LibraryMatch[] | null> {
	const search = { target_project: projectId, search_text: words, most_matches: LibrarySearchLimits.mostMatches };
	const { data, error } = await supabase.rpc('search_project_library', search);
	if (isSchemaNotYetMigrated(error)) return null;
	if (error) throw error;
	return ((data ?? []) as SearchRow[]).map((row) => matchOf(projectId, row));
}

function matchOf(projectId: string, row: SearchRow): LibraryMatch {
	return {
		kind: row.kind,
		id: row.item_id,
		projectId,
		title: row.title,
		summary: row.summary,
		section: row.section,
		library: row.library,
		excerpt: excerptPartsOf(row.excerpt)
	};
}
