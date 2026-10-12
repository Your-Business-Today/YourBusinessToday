import type { SupabaseClient } from '@supabase/supabase-js';
import { parseCompanyToCheck, type CompanyToCheck } from './companyToCheckRecord';
import { validateFilingSentence } from '$lib/data/filingRules';
import type { ClassifiedFiling } from '$lib/server/companiesHouse/filingHistoryRecord';
import type { CompanyIndicators } from '$lib/data/companyIndicators';

export async function readCompaniesToCheck(supabase: SupabaseClient, pageSize: number): Promise<CompanyToCheck[]> {
	const { data, error } = await supabase.rpc('register_companies_to_check', { page_size: pageSize });
	if (error) throw error;
	return data.map(parseCompanyToCheck);
}

/** The filings kept as read; one whose sentence does not fit its column is refused with its reason. */
export async function storeFilings(supabase: SupabaseClient, companyNumber: string, filings: ClassifiedFiling[]): Promise<string | null> {
	const refusal = filings.map((filing) => validateFilingSentence(filing.sentence)).find((reason) => reason !== null) ?? null;
	if (refusal !== null) return refusal;
	if (filings.length === 0) return null;
	const rows = filings.map((filing) => ({
		transaction_id: filing.transactionId,
		company_number: companyNumber,
		filed_on: filing.filedOn === '' ? null : filing.filedOn,
		form_type: filing.formType,
		kind: filing.kind,
		sentence: filing.sentence,
		made_up_to: filing.madeUpTo === '' ? null : filing.madeUpTo
	}));
	const { error } = await supabase.from('company_filings').upsert(rows, { onConflict: 'transaction_id' });
	if (error) throw error;
	return null;
}

/** The standing flags and the newest filing seen go on the register row, with when it was checked. */
export async function recordCompanyChecked(supabase: SupabaseClient, companyNumber: string, indicators: CompanyIndicators, newestTransactionId: string): Promise<void> {
	const { error } = await supabase
		.from('register_companies')
		.update({
			last_filing_transaction_id: newestTransactionId,
			status_detail: indicators.statusDetail,
			last_accounts_type: indicators.lastAccountsType,
			is_accounts_overdue: indicators.isAccountsOverdue,
			is_confirmation_overdue: indicators.isConfirmationOverdue,
			has_insolvency: indicators.hasInsolvency,
			has_charges: indicators.hasCharges,
			filings_checked_at: new Date().toISOString()
		})
		.eq('company_number', companyNumber);
	if (error) throw error;
}
