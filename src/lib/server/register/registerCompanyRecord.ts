import type { Coordinates } from '$lib/data/distance';

/** A company as the monthly Companies House file describes it, kept by number. */
export type RegisterCompany = {
	companyNumber: string;
	name: string;
	registeredAddress: string;
	postcode: string;
	outcode: string;
	sector: string;
	companyStatus: string;
	incorporatedOn: string;
	accountCategory: string;
	sicCodes: string[];
	nextAccountsDue: string;
	nextStatementDue: string;
	chargeCount: number;
	firstSeenMonth: string;
	lastSeenMonth: string;
	isGone: boolean;
	sourceUrl: string;
};

export type LocatedRegisterCompany = RegisterCompany & Coordinates;

export function parseRegisterCompanyRecord(row: Record<string, unknown>): RegisterCompany {
	return {
		companyNumber: row.company_number as string,
		name: row.name as string,
		registeredAddress: (row.registered_address ?? '') as string,
		postcode: (row.postcode ?? '') as string,
		outcode: (row.outcode ?? '') as string,
		sector: (row.sector ?? '') as string,
		companyStatus: (row.company_status ?? '') as string,
		incorporatedOn: (row.incorporated_on ?? '') as string,
		accountCategory: (row.account_category ?? '') as string,
		sicCodes: (row.sic_codes ?? []) as string[],
		nextAccountsDue: (row.next_accounts_due ?? '') as string,
		nextStatementDue: (row.next_statement_due ?? '') as string,
		chargeCount: Number(row.charge_count ?? 0),
		firstSeenMonth: row.first_seen_month as string,
		lastSeenMonth: row.last_seen_month as string,
		isGone: Boolean(row.is_gone),
		sourceUrl: (row.source_url ?? '') as string
	};
}

export function parseLocatedRegisterCompany(row: Record<string, unknown>): LocatedRegisterCompany {
	return { ...parseRegisterCompanyRecord(row), latitude: Number(row.latitude), longitude: Number(row.longitude) };
}
