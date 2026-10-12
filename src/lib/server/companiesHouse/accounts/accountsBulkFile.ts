import { httpByteSource } from '$lib/server/zip/httpByteSource';
import { parseAccountsFileName, type AccountsFiling } from './accountsFileName';
import { readZipDirectory } from '$lib/server/zip/readZipDirectory';
import type { ByteSource } from '$lib/server/zip/byteSource';
import type { ZipEntry } from '$lib/server/zip/zipDirectoryEntries';

export const accountsBulkOrigin = 'https://download.companieshouse.gov.uk';
const filePrefix = '/Accounts_Bulk_Data-';
const fileSuffix = '.zip';
export const filingHistoryOrigin = 'https://find-and-update.company-information.service.gov.uk/company/';

/** One day's accounts zip opened by its directory: every filing named, with the bytes of any one of them readable on demand. */
export type AccountsBulkFile = { publishedOn: string; filings: AccountsFiling[]; source: ByteSource; entriesByName: Map<string, ZipEntry> };

export function accountsBulkFileUrl(publishedOn: string): URL {
	return new URL(`${filePrefix}${publishedOn}${fileSuffix}`, accountsBulkOrigin);
}

/** The day's file, or null when Companies House published none for that day. */
export async function openAccountsBulkFile(publishedOn: string): Promise<AccountsBulkFile | null> {
	const source = await httpByteSource(accountsBulkFileUrl(publishedOn));
	if (source === null) return null;
	const entries = await readZipDirectory(source);
	const filings = entries.flatMap((entry) => {
		const filing = parseAccountsFileName(entry.name);
		return filing === null ? [] : [filing];
	});
	return { publishedOn, filings, source, entriesByName: new Map(entries.map((entry) => [entry.name, entry])) };
}

export function filingHistoryUrl(companyNumber: string): string {
	return `${filingHistoryOrigin}${companyNumber}/filing-history`;
}
