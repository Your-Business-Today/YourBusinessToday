import type { CompanyIndicators } from '$lib/data/companyIndicators';

/** A register company as the filings sweep picks it up: what was stored last time, to tell new from old. */
export type CompanyToCheck = {
	companyNumber: string;
	name: string;
	outcode: string;
	sector: string;
	sourceUrl: string;
	lastFilingTransactionId: string;
	indicators: CompanyIndicators;
	filingsCheckedAt: string | null;
};

export function parseCompanyToCheck(row: Record<string, unknown>): CompanyToCheck {
	return {
		companyNumber: row.company_number as string,
		name: row.name as string,
		outcode: (row.outcode ?? '') as string,
		sector: (row.sector ?? '') as string,
		sourceUrl: (row.source_url ?? '') as string,
		lastFilingTransactionId: (row.last_filing_transaction_id ?? '') as string,
		indicators: indicatorsOf(row),
		filingsCheckedAt: (row.filings_checked_at ?? null) as string | null
	};
}

/** The standing flags as a register row keeps them. */
export function indicatorsOf(row: Record<string, unknown>): CompanyIndicators {
	return {
		statusDetail: (row.status_detail ?? '') as string,
		lastAccountsType: (row.last_accounts_type ?? '') as string,
		isAccountsOverdue: Boolean(row.is_accounts_overdue),
		isConfirmationOverdue: Boolean(row.is_confirmation_overdue),
		hasInsolvency: Boolean(row.has_insolvency),
		hasCharges: Boolean(row.has_charges)
	};
}
