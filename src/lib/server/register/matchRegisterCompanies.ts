import type { SupabaseClient } from '@supabase/supabase-js';

/** The register's own words for a company a daily file or a notice names. */
export type MatchedRegisterCompany = { companyNumber: string; name: string; outcode: string; sector: string; sourceUrl: string; isGone: boolean };

/** The register rows among the company numbers given, in one call however many numbers there are. */
export async function matchRegisterCompanies(supabase: SupabaseClient, companyNumbers: string[]): Promise<Map<string, MatchedRegisterCompany>> {
	const numbers = [...new Set(companyNumbers)];
	if (numbers.length === 0) return new Map();
	const { data, error } = await supabase.rpc('match_register_companies', { numbers });
	if (error) throw error;
	return new Map(data.map((row: Record<string, unknown>) => [row.company_number as string, matchedCompanyOf(row)]));
}

function matchedCompanyOf(row: Record<string, unknown>): MatchedRegisterCompany {
	return {
		companyNumber: row.company_number as string,
		name: row.name as string,
		outcode: (row.outcode ?? '') as string,
		sector: (row.sector ?? '') as string,
		sourceUrl: (row.source_url ?? '') as string,
		isGone: Boolean(row.is_gone)
	};
}
