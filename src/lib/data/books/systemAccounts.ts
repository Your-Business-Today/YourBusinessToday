import { LedgerAccountTypes, type LedgerAccountType } from './ledgerAccountTypes';

/** An account the books post to by themselves, by the code and name yourbooks.today gave it. */
export type SystemAccount = { code: string; name: string; accountType: LedgerAccountType };

/** What customers owe on issued invoices, and where the money they pay arrives. */
export const SystemAccounts = {
	tradeDebtors: { code: '1100', name: 'Trade debtors', accountType: LedgerAccountTypes.asset },
	bank: { code: '1200', name: 'Bank', accountType: LedgerAccountTypes.asset }
} as const satisfies Record<string, SystemAccount>;
