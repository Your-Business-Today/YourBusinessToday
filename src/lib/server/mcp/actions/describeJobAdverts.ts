import type { JobAdvert } from '$lib/data/jobAdvertRules';

export type CompanyJobAdverts = { companyName: string; adverts: JobAdvert[] };

const isoDayLength = 10;

const noneKept =
	'None are kept yet. Search the job boards for them yourself and save what you find with save_company_job_adverts.';

/** The adverts kept on a company, each with its board page, dates and whether it is a role we replace or amplify. */
export function describeJobAdverts(reading: CompanyJobAdverts): string {
	const { companyName, adverts } = reading;
	if (adverts.length === 0) return `No job adverts are kept for ${companyName}. ${noneKept}`;
	return [`Job adverts kept for ${companyName}, as staff Claudes found them on the job boards:`, ...adverts.map(advertLine)].join('\n');
}

function advertLine(advert: JobAdvert): string {
	const posted = advert.postedOn === '' ? 'date not shown' : `posted ${advert.postedOn}`;
	const found = `found ${advert.foundAt.slice(0, isoDayLength)}`;
	const role = advert.matchedRole === null ? '' : ` — ${advert.matchedRole}, a role we replace or amplify`;
	return `- ${advert.title} (${posted}, ${found}) ${advert.url}${role}`;
}
