import type { CompanyIndicators } from '$lib/data/companyIndicators';

/** The profile as the sweep keeps it: the status and the indicators, nothing a person would not act on. */
export type CompanyProfile = { companyNumber: string; name: string; status: string; indicators: CompanyIndicators };

export function parseCompanyProfile(body: Record<string, unknown>): CompanyProfile {
	const accounts = (body.accounts ?? {}) as Record<string, unknown>;
	const lastAccounts = (accounts.last_accounts ?? {}) as Record<string, unknown>;
	const confirmation = (body.confirmation_statement ?? {}) as Record<string, unknown>;
	const links = (body.links ?? {}) as Record<string, unknown>;
	return {
		companyNumber: String(body.company_number ?? ''),
		name: String(body.company_name ?? ''),
		status: String(body.company_status ?? ''),
		indicators: {
			statusDetail: String(body.company_status_detail ?? ''),
			lastAccountsType: String(lastAccounts.type ?? ''),
			isAccountsOverdue: Boolean(accounts.overdue),
			isConfirmationOverdue: Boolean(confirmation.overdue),
			hasInsolvency: Boolean(body.has_insolvency_history) || links.insolvency !== undefined,
			hasCharges: Boolean(body.has_charges) || links.charges !== undefined
		}
	};
}
