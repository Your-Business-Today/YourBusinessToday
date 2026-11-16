import type { SupabaseClient } from '@supabase/supabase-js';
import { parseLocatedRegisterCompany, type LocatedRegisterCompany } from './registerCompanyRecord';

const rowsPerPage = 1000;

/** Every located register company in a patch, read page by page past PostgREST's row cap. */
export async function readRegisterForPatch(supabase: SupabaseClient, patchId: string): Promise<LocatedRegisterCompany[]> {
	const companies: LocatedRegisterCompany[] = [];
	let firstRowIndex = 0;
	for (;;) {
		const page = await readPage(supabase, patchId, firstRowIndex);
		companies.push(...page);
		if (page.length < rowsPerPage) return companies;
		firstRowIndex += rowsPerPage;
	}
}

async function readPage(supabase: SupabaseClient, patchId: string, firstRowIndex: number): Promise<LocatedRegisterCompany[]> {
	const { data, error } = await supabase
		.rpc('patch_register_companies', { target_patch_id: patchId })
		.range(firstRowIndex, firstRowIndex + rowsPerPage - 1);
	if (error) throw error;
	return data.map(parseLocatedRegisterCompany);
}

/** How many live companies the register holds in the outcodes, whether or not their postcodes are placed on the map yet. */
export async function countRegisterCompaniesIn(supabase: SupabaseClient, outcodes: string[]): Promise<number> {
	if (outcodes.length === 0) return 0;
	const { count, error } = await supabase.from('register_companies').select('company_number', { count: 'exact', head: true }).in('outcode', outcodes).eq('is_gone', false);
	if (error) throw error;
	return count ?? 0;
}
