import { sweepAccountsFiled } from '$lib/server/companiesHouse/accounts/sweepAccountsFiled';
import type { WatchSource } from './watchSource';

export const accountsFiledSourceName = 'accounts_filed';

/** Accounts filed yesterday by a register company, from the keyless daily accounts file, with the figures they carry. */
export const accountsFiledSource: WatchSource = {
	name: accountsFiledSourceName,
	summary: 'reads the daily accounts file for filings by register companies and the figures they filed',
	run: sweepAccountsFiled
};
