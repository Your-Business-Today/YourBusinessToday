import type { SupabaseClient } from '@supabase/supabase-js';
import { parseRegisterCompanyRecord, type RegisterCompany } from './registerCompanyRecord';

export async function getRegisterCompany(supabase: SupabaseClient, companyNumber: string): Promise<RegisterCompany | null> {
	if (companyNumber === '') return null;
	const { data, error } = await supabase
		.from('register_companies')
		.select('*')
		.eq('company_number', companyNumber)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseRegisterCompanyRecord(data);
}
