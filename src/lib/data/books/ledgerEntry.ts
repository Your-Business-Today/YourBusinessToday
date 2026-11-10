import type { LedgerAccountType } from './ledgerAccountTypes';

/** One posted journal line with its journal's date and its account, as every report reads it. */
export type LedgerEntry = {
	journalDate: string;
	accountId: string;
	accountCode: string;
	accountName: string;
	accountType: LedgerAccountType;
	costCentreId: string | null;
	debit: number;
	credit: number;
};
