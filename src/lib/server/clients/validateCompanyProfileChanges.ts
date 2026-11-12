import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { companyWebsiteRefusal } from './researchSourceRefusal';
import { parseHeadcountBand } from '$lib/data/headcountBands';
import { trimmedText } from '$lib/data/trimmedText';
import { validateCompanyProfileFindings } from './validateCompanyProfileFindings';
import { validatePublicUrl } from './parsePublicUrl';
import type { CompanyProfile } from './companyProfile';

/** The parts of a client's company profile a staff member changed, with the website that sits beside it. */
export type CompanyProfileChanges = Partial<CompanyProfile> & { website?: string };

const { longestWebsite, longestSourceUrl, longestSummary, mostOpeningAngles, longestOpeningAngle } = companyResearchLimits;
const longestOpeningAngles = mostOpeningAngles * longestOpeningAngle;
const factFields = ['industry', 'location', 'postcode', 'headcountBand', 'companyNumber'] as const;

export const companyProfileRefusals = {
	summaryTooLong: `The summary is at most ${longestSummary} characters.`,
	openingAnglesTooLong: `The openingAngles are at most ${longestOpeningAngles} characters.`,
	sourceUrlTooLong: `The sourceUrl is at most ${longestSourceUrl} characters.`
} as const;

/** The changes as given, each checked against its column, or a sentence naming the field that does not fit. */
export function validateCompanyProfileChanges(input: Record<string, unknown>, held: CompanyProfile): CompanyProfileChanges | string {
	const facts = validateCompanyProfileFindings(factsAsSent(input, held));
	if (typeof facts === 'string') return facts;
	const changes: CompanyProfileChanges = { ...facts, headcountBand: parseHeadcountBand(facts.headcountBand) };
	const refusal = readWebsite(input, changes) ?? readProse(input, changes) ?? readSourceUrl(input, changes);
	if (refusal !== null) return refusal;
	return changes;
}

/** The five facts are checked together, so a fact not sent stands in as held. */
function factsAsSent(input: Record<string, unknown>, held: CompanyProfile): Record<string, unknown> {
	return Object.fromEntries(factFields.map((field) => [field, field in input ? input[field] : held[field]]));
}

function readWebsite(input: Record<string, unknown>, changes: CompanyProfileChanges): string | null {
	if (!('website' in input)) return null;
	const website = trimmedText(input.website);
	const refusal = companyWebsiteRefusal(website, longestWebsite);
	if (refusal !== null) return refusal;
	changes.website = website;
	return null;
}

function readProse(input: Record<string, unknown>, changes: CompanyProfileChanges): string | null {
	if ('summary' in input) {
		const summary = trimmedText(input.summary);
		if (summary.length > longestSummary) return companyProfileRefusals.summaryTooLong;
		changes.summary = summary;
	}
	if (!('openingAngles' in input)) return null;
	const openingAngles = trimmedText(input.openingAngles);
	if (openingAngles.length > longestOpeningAngles) return companyProfileRefusals.openingAnglesTooLong;
	changes.openingAngles = openingAngles;
	return null;
}

function readSourceUrl(input: Record<string, unknown>, changes: CompanyProfileChanges): string | null {
	if (!('sourceUrl' in input)) return null;
	const sourceUrl = trimmedText(input.sourceUrl);
	if (sourceUrl.length > longestSourceUrl) return companyProfileRefusals.sourceUrlTooLong;
	const refusal = validatePublicUrl('sourceUrl', sourceUrl);
	if (refusal !== null) return refusal;
	changes.sourceUrl = sourceUrl;
	return null;
}
