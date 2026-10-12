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

export type RegisterLoadState = { asAtMonth: string | null };

/** The month the register was last loaded for any of the outcodes, or null when it never was. */
export async function readRegisterLoadState(supabase: SupabaseClient, outcodes: string[]): Promise<RegisterLoadState> {
	if (outcodes.length === 0) return { asAtMonth: null };
	const { data, error } = await supabase
		.from('register_loads')
		.select('loaded_month')
		.in('outcode', outcodes)
		.order('loaded_month', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	return { asAtMonth: data === null ? null : (data.loaded_month as string) };
}
