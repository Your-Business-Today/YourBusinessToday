/** The account_type values books_ledger_accounts accepts (migration 0151). */
export const LedgerAccountTypes = {
	asset: 'asset',
	liability: 'liability',
	equity: 'equity',
	income: 'income',
	expense: 'expense'
} as const;

export type LedgerAccountType = (typeof LedgerAccountTypes)[keyof typeof LedgerAccountTypes];

const debitNormalTypes: readonly LedgerAccountType[] = [LedgerAccountTypes.asset, LedgerAccountTypes.expense];

/** Whether a debit increases the account's balance, as it does for assets and expenses. */
export function isDebitNormal(accountType: LedgerAccountType): boolean {
	return debitNormalTypes.includes(accountType);
}
