import { outcodeOf, postcodeIn, sectorOf } from '$lib/data/postcode';

/** One company as the loader writes it: the file's row read against the register columns. */
export type RegisterCompanySeed = {
	company_number: string;
	name: string;
	registered_address: string;
	postcode: string;
	outcode: string;
	sector: string;
	company_status: string;
	incorporated_on: string | null;
	account_category: string;
	sic_codes: string[];
	next_accounts_due: string | null;
	next_statement_due: string | null;
	charge_count: number;
	seen_month: string;
	source_url: string;
};

export const registerFileHeadings = {
	name: 'CompanyName',
	number: 'CompanyNumber',
	postcode: 'RegAddress.PostCode',
	status: 'CompanyStatus',
	incorporated: 'IncorporationDate',
	accountCategory: 'Accounts.AccountCategory',
	accountsDue: 'Accounts.NextDueDate',
	statementDue: 'ConfStmtNextDueDate',
	charges: 'Mortgages.NumMortCharges',
	sicCodes: ['SICCode.SicText_1', 'SICCode.SicText_2', 'SICCode.SicText_3', 'SICCode.SicText_4'],
	addressLines: ['RegAddress.AddressLine1', 'RegAddress.AddressLine2', 'RegAddress.PostTown', 'RegAddress.County']
} as const;

const companyPageOrigin = 'https://find-and-update.company-information.service.gov.uk/company/';
const britishDate = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const sicCodeShape = /^\d{5}/;

export type RegisterFileRow = Record<string, string>;

/** The row as a seed, or null when it carries no company number and so cannot be a register row. */
export function readRegisterCompany(row: RegisterFileRow, seenMonth: string): RegisterCompanySeed | null {
	const companyNumber = (row[registerFileHeadings.number] ?? '').trim();
	if (companyNumber === '') return null;
	const postcode = postcodeIn(row[registerFileHeadings.postcode] ?? '');
	return {
		company_number: companyNumber,
		name: (row[registerFileHeadings.name] ?? '').trim(),
		registered_address: addressOf(row),
		postcode,
		outcode: outcodeOf(postcode),
		sector: sectorOf(postcode),
		company_status: (row[registerFileHeadings.status] ?? '').trim(),
		incorporated_on: isoDateOf(row[registerFileHeadings.incorporated] ?? ''),
		account_category: (row[registerFileHeadings.accountCategory] ?? '').trim(),
		sic_codes: sicCodesOf(row),
		next_accounts_due: isoDateOf(row[registerFileHeadings.accountsDue] ?? ''),
		next_statement_due: isoDateOf(row[registerFileHeadings.statementDue] ?? ''),
		charge_count: Number(row[registerFileHeadings.charges] ?? 0) || 0,
		seen_month: seenMonth,
		source_url: `${companyPageOrigin}${companyNumber}`
	};
}

function addressOf(row: RegisterFileRow): string {
	return registerFileHeadings.addressLines
		.map((heading) => (row[heading] ?? '').trim())
		.filter((line) => line !== '')
		.join(', ');
}

function sicCodesOf(row: RegisterFileRow): string[] {
	return registerFileHeadings.sicCodes
		.map((heading) => sicCodeShape.exec((row[heading] ?? '').trim())?.[0] ?? '')
		.filter((code) => code !== '');
}

/** The file writes DD/MM/YYYY; the column is a date. */
export function isoDateOf(text: string): string | null {
	const match = britishDate.exec(text.trim());
	if (match === null) return null;
	return `${match[3]}-${match[2]}-${match[1]}`;
}
