import type { CompanyJobAdverts, JobAdvert } from '$lib/server/jobAdverts/jobAdvert';

export function describeJobAdverts(reading: CompanyJobAdverts): string {
	const { companyName, adverts } = reading;
	if (adverts.length === 0) return `No open adverts for ${companyName} were found on the job boards.`;
	return [`Open adverts for ${companyName}, read on the job boards:`, ...adverts.map(advertLine)].join('\n');
}

function advertLine(advert: JobAdvert): string {
	const posted = advert.postedOn === '' ? 'date not shown' : `posted ${advert.postedOn}`;
	const role = advert.matchedRole === null ? '' : ` — ${advert.matchedRole}, a role we replace or amplify`;
	return `- ${advert.title} (${posted}) ${advert.url}${role}`;
}
