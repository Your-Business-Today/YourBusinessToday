import type { SupabaseClient } from '@supabase/supabase-js';
import type { OrganisationModule } from '$lib/data/organisationModules';

/** An organisation whose books the billing run reads. */
export type BooksOrganisation = { id: string; name: string };

const booksModule: OrganisationModule = 'books';

/** Every organisation with Accounts switched on, by name. */
export async function findOrganisationsKeepingBooks(supabase: SupabaseClient): Promise<BooksOrganisation[]> {
	const { data, error } = await supabase.from('organisation_modules').select('organisation_id').eq('module', booksModule).eq('is_on', true);
	if (error !== null) throw error;
	const organisationIds = (data as { organisation_id: string }[]).map((row) => row.organisation_id);
	if (organisationIds.length === 0) return [];
	const named = await supabase.from('organisations').select('id, name').in('id', organisationIds).order('name');
	if (named.error !== null) throw named.error;
	return named.data as BooksOrganisation[];
}
