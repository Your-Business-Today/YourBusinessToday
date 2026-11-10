import { LedgerAccountTypes, type LedgerAccountType } from './ledgerAccountTypes';

/** An account the books post to by themselves, by the code and name yourbooks.today gave it. */
export type SystemAccount = { code: string; name: string; accountType: LedgerAccountType };

/**
 * What customers owe on issued invoices, where money arrives and leaves, what is paid up front for months to come,
 * and what is owed to suppliers for costs not yet paid.
 */
export const SystemAccounts = {
	tradeDebtors: { code: '1100', name: 'Trade debtors', accountType: LedgerAccountTypes.asset },
	bank: { code: '1200', name: 'Bank', accountType: LedgerAccountTypes.asset },
	prepayments: { code: '1300', name: 'Prepayments', accountType: LedgerAccountTypes.asset },
	tradeCreditors: { code: '2100', name: 'Trade creditors', accountType: LedgerAccountTypes.liability }
} as const satisfies Record<string, SystemAccount>;
