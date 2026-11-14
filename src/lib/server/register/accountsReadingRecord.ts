import type { AccountsOutcome, AccountsReading, ReadMethod } from '$lib/data/accountsReadingRules';

export const accountsReadingColumns =
	'company_number, outcome, read_method, accounts_type, made_up_to, transaction_id, cash, current_assets, net_assets, creditors, average_employees, document_url, read_page, read_by_account_id, read_at';

export function parseAccountsReading(row: Record<string, unknown>): AccountsReading {
	return {
		companyNumber: row.company_number as string,
		outcome: row.outcome as AccountsOutcome,
		readMethod: row.read_method as ReadMethod,
		accountsType: (row.accounts_type ?? '') as string,
		madeUpTo: (row.made_up_to ?? null) as string | null,
		transactionId: (row.transaction_id ?? '') as string,
		cash: amountOf(row.cash),
		currentAssets: amountOf(row.current_assets),
		netAssets: amountOf(row.net_assets),
		creditors: amountOf(row.creditors),
		averageEmployees: amountOf(row.average_employees),
		documentUrl: (row.document_url ?? '') as string,
		readPage: (row.read_page ?? '') as string,
		readByAccountId: (row.read_by_account_id ?? null) as string | null,
		readAt: row.read_at as string
	};
}

export function accountsReadingRowOf(reading: AccountsReading): Record<string, unknown> {
	return {
		company_number: reading.companyNumber,
		outcome: reading.outcome,
		read_method: reading.readMethod,
		accounts_type: reading.accountsType,
		made_up_to: reading.madeUpTo,
		transaction_id: reading.transactionId,
		cash: reading.cash,
		current_assets: reading.currentAssets,
		net_assets: reading.netAssets,
		creditors: reading.creditors,
		average_employees: reading.averageEmployees,
		document_url: reading.documentUrl,
		read_page: reading.readPage,
		read_by_account_id: reading.readByAccountId,
		read_at: reading.readAt
	};
}

function amountOf(value: unknown): number | null {
	return value === null || value === undefined ? null : Number(value);
}
