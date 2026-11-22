import type { SupabaseClient } from '@supabase/supabase-js';
import { checkSearchWords } from '$lib/projectLibrary/validateSearchWords';
import { librarySearchQueryKey, type LibrarySearch } from '$lib/projectLibrary/libraryMatch';
import { searchProjectLibrary } from './searchProjectLibrary';

/** The search the page's address asks for, run over the project's videos and documents; none when it names no words. */
export async function readLibrarySearch(supabase: SupabaseClient, projectId: string, address: URL): Promise<LibrarySearch | null> {
	const words = address.searchParams.get(librarySearchQueryKey) ?? '';
	if (words.trim() === '') return null;
	const checked = checkSearchWords(words);
	if ('refusal' in checked) return { words, matches: [], refusal: checked.refusal };
	const matches = await searchProjectLibrary(supabase, projectId, checked.value);
	return { words, matches: matches ?? [], refusal: null };
}
