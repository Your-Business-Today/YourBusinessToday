import type { SupabaseClient } from '@supabase/supabase-js';

/** A company asked to be left alone is skipped by every reader and loader. */
export async function isSuppressedCompany(supabase: SupabaseClient, companyNumber: string): Promise<boolean> {
	const { data, error } = await supabase.from('suppressed_companies').select('company_number').eq('company_number', companyNumber).maybeSingle();
	if (error) throw error;
	return data !== null;
}
