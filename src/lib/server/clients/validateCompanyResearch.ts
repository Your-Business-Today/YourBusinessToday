import { companyResearchLimits, type CompanyResearchFindings } from '$lib/data/companyResearchRules';
import { companyWebsiteRefusal, researchSourceRefusal } from './researchSourceRefusal';
import { trimmedText } from '$lib/data/trimmedText';
import { validateCompanyProfileFindings } from './validateCompanyProfileFindings';
import { validateOpeningAngles } from './validateOpeningAngles';
import { validateRecordId } from '$lib/data/isUuid';
import { validateResearchedPeople } from './validateResearchedPeople';

const { longestName, longestWebsite, longestSourceUrl, longestSummary } = companyResearchLimits;

export const newLeadNeedsName = 'A company that is not on the register yet needs its name; give clientId for one that is.';
export const findingsNeedSummary = `The summary is 1 to ${longestSummary} characters: what they do, who for, and how they run.`;

/** The findings as given, each value checked against the column it is written to, or a sentence naming what does not fit. */
export function validateCompanyResearch(input: Record<string, unknown>): CompanyResearchFindings | string {
	const clientId = trimmedText(input.clientId);
	const name = trimmedText(input.name);
	const identityRefusal = companyIdentityRefusal(clientId, name);
	if (identityRefusal !== null) return identityRefusal;
	const website = trimmedText(input.website);
	const sourceUrl = trimmedText(input.sourceUrl);
	const summary = trimmedText(input.summary);
	const pageRefusal = companyWebsiteRefusal(website, longestWebsite) ?? researchSourceRefusal('sourceUrl', sourceUrl, longestSourceUrl);
	if (pageRefusal !== null) return pageRefusal;
	if (summary === '' || summary.length > longestSummary) return findingsNeedSummary;
	const profile = validateCompanyProfileFindings(input);
	if (typeof profile === 'string') return profile;
	const openingAngles = validateOpeningAngles(input.openingAngles);
	if (typeof openingAngles === 'string') return openingAngles;
	const people = validateResearchedPeople(input.people);
	if (typeof people === 'string') return people;
	return { clientId: clientId === '' ? null : clientId, name, website, sourceUrl, summary, ...profile, openingAngles, people };
}

function companyIdentityRefusal(clientId: string, name: string): string | null {
	if (name.length > longestName) return `The name is at most ${longestName} characters.`;
	if (clientId !== '') return validateRecordId('clientId', clientId);
	if (name === '') return newLeadNeedsName;
	return null;
}
