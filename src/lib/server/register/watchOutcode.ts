import type { SupabaseClient } from '@supabase/supabase-js';
import { areaEventKinds } from '$lib/data/areaEventKind';
import { monthOf, watchedRowOf } from './watchedCompanyRow';
import { recordAreaEvent } from '$lib/server/areaEvents/recordAreaEvent';
import { searchCompaniesHousePage, type CompaniesHouseCompany, type CompaniesHouseSearch } from '$lib/server/companiesHouse/searchCompaniesHouse';
import { sectorOf } from '$lib/data/postcode';

const pageSize = 100;
const mostPages = 20;
const dissolved = 'dissolved';
const troubledStatuses = ['liquidation', 'administration', 'receivership', 'insolvency-proceedings', 'voluntary-arrangement'];

/** One outcode since a day: the companies incorporated, dissolved or in trouble, written and the first two told to the feed. */
export async function watchOutcode(supabase: SupabaseClient, outcode: string, sicCodes: string[], sinceDay: string): Promise<number> {
	const [incorporated, gone, troubled] = await Promise.all([
		everyPage({ sicCodes, location: outcode, incorporatedFrom: sinceDay }),
		everyPage({ sicCodes, location: outcode, dissolvedFrom: sinceDay, companyStatuses: [dissolved] }),
		everyPage({ sicCodes, location: outcode, companyStatuses: troubledStatuses })
	]);
	const companies = dedupe([...incorporated, ...gone, ...troubled]).filter((company) => company.postcode.toUpperCase().startsWith(`${outcode} `));
	await upsertWatched(supabase, companies, monthOf(sinceDay));
	for (const company of companies.filter((company) => company.incorporatedOn >= sinceDay)) await tell(supabase, company, areaEventKinds.companyIncorporated, company.incorporatedOn);
	for (const company of companies.filter((company) => company.dissolvedOn >= sinceDay && company.dissolvedOn !== '')) await tell(supabase, company, areaEventKinds.companyDissolved, company.dissolvedOn);
	return companies.length;
}

async function everyPage(search: CompaniesHouseSearch): Promise<CompaniesHouseCompany[]> {
	const companies: CompaniesHouseCompany[] = [];
	for (let page = 0; page < mostPages; page += 1) {
		const { companies: found } = await searchCompaniesHousePage({ ...search, startIndex: page * pageSize }, pageSize);
		companies.push(...found);
		if (found.length < pageSize) return companies;
	}
	return companies;
}

function dedupe(companies: CompaniesHouseCompany[]): CompaniesHouseCompany[] {
	return [...new Map(companies.map((company) => [company.companyNumber, company])).values()];
}

async function upsertWatched(supabase: SupabaseClient, companies: CompaniesHouseCompany[], seenMonth: string): Promise<void> {
	if (companies.length === 0) return;
	const { error } = await supabase.rpc('upsert_watched_companies', { rows: companies.map((company) => watchedRowOf(company, seenMonth)) });
	if (error) throw error;
}

function tell(supabase: SupabaseClient, company: CompaniesHouseCompany, kind: 'company_incorporated' | 'company_dissolved', happenedOn: string): Promise<void> {
	const { sicCodes } = company;
	return recordAreaEvent(supabase, {
		sector: sectorOf(company.postcode),
		patchId: null,
		kind,
		actorAccountId: null,
		companyNumber: company.companyNumber,
		detail: `${company.name}${sicCodes.length === 0 ? '' : ` (SIC ${sicCodes.join(', ')})`}`,
		sourceUrl: `https://find-and-update.company-information.service.gov.uk/company/${company.companyNumber}`,
		sourceKey: `${kind}:${company.companyNumber}`,
		happenedAt: happenedOn
	});
}
