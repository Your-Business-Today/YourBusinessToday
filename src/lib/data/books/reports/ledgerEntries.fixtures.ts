import type { LedgerAccountType } from '../ledgerAccountTypes';
import type { LedgerEntry } from '../ledgerEntry';

type Account = { accountId: string; accountCode: string; accountName: string; accountType: LedgerAccountType };

const account = (accountCode: string, accountName: string, accountType: LedgerAccountType): Account => ({
	accountId: `account-${accountCode}`,
	accountCode,
	accountName,
	accountType
});

export const accounts = {
	bank: account('1200', 'Bank', 'asset'),
	debtors: account('1100', 'Debtors', 'asset'),
	vat: account('2200', 'VAT', 'liability'),
	capital: account('3000', 'Capital', 'equity'),
	sales: account('4000', 'Sales', 'income'),
	rent: account('5000', 'Rent', 'expense')
};

export const costCentres = { shop: 'cost-centre-shop', office: 'cost-centre-office' };

function entry(journalDate: string, posted: Account, debit: number, credit: number, costCentreId: string | null = null): LedgerEntry {
	return { journalDate, ...posted, costCentreId, debit, credit };
}

/** A year's first quarter, starting in April: capital in, a sale invoiced and paid, rent paid, March's sale before. */
export const firstQuarterEntries: LedgerEntry[] = [
	entry('2026-03-20', accounts.bank, 50, 0),
	entry('2026-03-20', accounts.sales, 0, 50, costCentres.shop),
	entry('2026-04-01', accounts.bank, 10000, 0),
	entry('2026-04-01', accounts.capital, 0, 10000),
	entry('2026-05-10', accounts.debtors, 1200, 0),
	entry('2026-05-10', accounts.sales, 0, 1000, costCentres.shop),
	entry('2026-05-10', accounts.vat, 0, 200),
	entry('2026-06-15', accounts.bank, 1200, 0),
	entry('2026-06-15', accounts.debtors, 0, 1200),
	entry('2026-06-20', accounts.rent, 300.1, 0, costCentres.office),
	entry('2026-06-20', accounts.bank, 0, 300.1),
	entry('2026-07-01', accounts.rent, 999, 0, costCentres.office),
	entry('2026-07-01', accounts.bank, 0, 999)
];
