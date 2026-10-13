export type JobAdvertSubject = { companyName: string; place: string };

export const jobAdvertSubjectLimits = { longestCompanyName: 200, longestPlace: 200 };

export const companyNameNeeded = 'A company name is needed to look for its job adverts.';

export function validateJobAdvertSubject(subject: JobAdvertSubject): string | null {
	const { longestCompanyName, longestPlace } = jobAdvertSubjectLimits;
	const { companyName, place } = subject;
	if (companyName === '') return companyNameNeeded;
	if (companyName.length > longestCompanyName) return `The company name is longer than ${longestCompanyName} characters.`;
	if (place.length > longestPlace) return `The place is longer than ${longestPlace} characters.`;
	return null;
}
