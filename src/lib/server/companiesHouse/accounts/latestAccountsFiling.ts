import { companiesHouseApiOrigin, requestCompaniesHouse } from '../companiesHouseRequest';

/** The newest accounts a company filed, as its filing history lists them. */
export type AccountsFilingEntry = { transactionId: string; accountsType: string; madeUpTo: string; documentId: string };

const accountsCategory = 'accounts';
const newestOnly = 1;
const accountsTypeIn = /^accounts-with-accounts-type-(.+)$/;
const documentIdIn = /\/document\/([A-Za-z0-9_-]+)/;

/** One call: the newest accounts filing, or null when the company has filed none. */
export async function getLatestAccountsFiling(companyNumber: string): Promise<AccountsFilingEntry | null> {
	const url = new URL(`/company/${encodeURIComponent(companyNumber)}/filing-history`, companiesHouseApiOrigin);
	url.searchParams.set('category', accountsCategory);
	url.searchParams.set('items_per_page', String(newestOnly));
	return parseLatestAccountsFiling(await requestCompaniesHouse(url));
}

export function parseLatestAccountsFiling(body: Record<string, unknown>): AccountsFilingEntry | null {
	const items = Array.isArray(body.items) ? (body.items as Record<string, unknown>[]) : [];
	const [newest] = items;
	if (newest === undefined) return null;
	const values = (newest.description_values ?? {}) as Record<string, unknown>;
	const links = (newest.links ?? {}) as Record<string, unknown>;
	return {
		transactionId: String(newest.transaction_id ?? ''),
		accountsType: accountsTypeIn.exec(String(newest.description ?? ''))?.[1] ?? '',
		madeUpTo: String(values.made_up_date ?? ''),
		documentId: documentIdIn.exec(String(links.document_metadata ?? ''))?.[1] ?? ''
	};
}
