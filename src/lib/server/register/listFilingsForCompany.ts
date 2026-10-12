import type { SupabaseClient } from '@supabase/supabase-js';
import { feedKindOfFiling, type FilingKind } from '$lib/data/filingKinds';
import type { ClassifiedFiling } from '$lib/server/companiesHouse/filingHistoryRecord';

const mostFilingsRead = 50;

/** The filings the weekly sweep stored for a company, newest first. */
export async function listFilingsForCompany(supabase: SupabaseClient, companyNumber: string): Promise<ClassifiedFiling[]> {
	if (companyNumber === '') return [];
	const { data, error } = await supabase
		.from('company_filings')
		.select('transaction_id, filed_on, form_type, kind, sentence, made_up_to')
		.eq('company_number', companyNumber)
		.order('filed_on', { ascending: false })
		.limit(mostFilingsRead);
	if (error) throw error;
	return data.map(parseStoredFiling);
}

function parseStoredFiling(row: Record<string, unknown>): ClassifiedFiling {
	const kind = (row.kind ?? 'other') as FilingKind;
	return {
		transactionId: row.transaction_id as string,
		filedOn: (row.filed_on ?? '') as string,
		formType: (row.form_type ?? '') as string,
		kind,
		feedKind: feedKindOfFiling[kind] ?? feedKindOfFiling.other,
		sentence: row.sentence as string,
		madeUpTo: (row.made_up_to ?? '') as string
	};
}
