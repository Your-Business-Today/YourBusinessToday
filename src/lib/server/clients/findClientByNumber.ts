import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * A lead typed in by hand never captured a company number, so the same
 * company arriving from Companies House claims that row instead of a new one.
 */
export async function findNumberlessClientByName(
	supabase: SupabaseClient,
	name: string
): Promise<string | null> {
	const { data, error } = await supabase
		.from('clients')
		.select('id')
		.ilike('name', name)
		.eq('company_number', '')
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return data.id as string;
}

export async function stampCompanyNumber(
	supabase: SupabaseClient,
	clientId: string,
	companyNumber: string
): Promise<void> {
	const { error } = await supabase
		.from('clients')
		.update({ company_number: companyNumber })
		.eq('id', clientId);
	if (error) throw error;
}

export async function findClientByCompanyNumber(
	supabase: SupabaseClient,
	companyNumber: string
): Promise<string | null> {
	const { data, error } = await supabase
		.from('clients')
		.select('id')
		.eq('company_number', companyNumber)
		.limit(1)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return data.id as string;
}
