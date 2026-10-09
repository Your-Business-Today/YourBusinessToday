import { parseHeadcountBand, type HeadcountBand } from '$lib/data/headcountBands';
import { publicUrlOr } from './parsePublicUrl';
import { postcodeIn } from '$lib/data/postcode';

export type CompanyProfile = {
	industry: string;
	location: string;
	postcode: string;
	headcountBand: HeadcountBand;
	companyNumber: string;
	summary: string;
	openingAngles: string;
	sourceUrl: string;
};

export const emptyCompanyProfile: CompanyProfile = {
	industry: '',
	location: '',
	postcode: '',
	headcountBand: '',
	companyNumber: '',
	summary: '',
	openingAngles: '',
	sourceUrl: ''
};

export function parseCompanyProfileRecord(row: Record<string, unknown>): CompanyProfile {
	return {
		industry: (row.industry ?? '') as string,
		location: (row.location ?? '') as string,
		postcode: (row.postcode ?? '') as string,
		headcountBand: parseHeadcountBand(row.headcount_band),
		companyNumber: (row.company_number ?? '') as string,
		summary: (row.profile_summary ?? '') as string,
		openingAngles: (row.opening_angles ?? '') as string,
		sourceUrl: (row.profile_source_url ?? '') as string
	};
}

export function parseCompanyProfileForm(formData: FormData): CompanyProfile {
	return {
		industry: readTrimmed(formData, 'industry'),
		location: readTrimmed(formData, 'location'),
		postcode: postcodeIn(readTrimmed(formData, 'postcode')),
		headcountBand: parseHeadcountBand(formData.get('headcountBand')),
		companyNumber: readTrimmed(formData, 'companyNumber'),
		summary: readTrimmed(formData, 'summary'),
		openingAngles: readTrimmed(formData, 'openingAngles'),
		sourceUrl: publicUrlOr(formData.get('sourceUrl'), '')
	};
}

export function toCompanyProfileColumns(profile: CompanyProfile): Record<string, unknown> {
	return {
		industry: profile.industry,
		location: profile.location,
		postcode: profile.postcode,
		headcount_band: profile.headcountBand,
		company_number: profile.companyNumber,
		profile_summary: profile.summary,
		opening_angles: profile.openingAngles,
		profile_source_url: profile.sourceUrl
	};
}

function readTrimmed(formData: FormData, field: string): string {
	return String(formData.get(field) ?? '').trim();
}
