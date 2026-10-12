import { formatBritishDate } from '$lib/data/britishDate';
import { indicatorSentence } from '$lib/data/companyIndicators';
import type { ClassifiedFiling } from '$lib/server/companiesHouse/filingHistoryRecord';
import type { CompanyProfile } from '$lib/server/companiesHouse/companyProfileRecord';

const filingHistoryOrigin = 'https://find-and-update.company-information.service.gov.uk/company/';

export function describeFilings(profile: CompanyProfile, filings: ClassifiedFiling[], readFrom: string): string {
	const indicators = indicatorSentence(profile.indicators);
	return [
		`${profile.name} — ${profile.companyNumber} — ${profile.status}${indicators === '' ? '' : ` — ${indicators}`}`,
		`Read ${readFrom}; the filings are at ${filingHistoryOrigin}${profile.companyNumber}/filing-history`,
		'',
		filings.length === 0 ? 'No filings.' : filings.map(describeFilingLine).join('\n')
	].join('\n');
}

export function describeFilingLine(filing: ClassifiedFiling): string {
	return `${formatBritishDate(filing.filedOn)} — ${filing.sentence}`;
}
