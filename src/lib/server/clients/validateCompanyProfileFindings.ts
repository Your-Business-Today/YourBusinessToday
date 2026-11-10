import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { postcodeIn } from '$lib/data/postcode';
import { trimmedText } from '$lib/data/trimmedText';
import { validateCompanyNumber } from '$lib/data/prospectRules';
import { validateHeadcountBand } from '$lib/data/headcountBands';

type ProfileFindings = { industry: string; location: string; postcode: string; headcountBand: string; companyNumber: string };

const { longestIndustry, longestLocation } = companyResearchLimits;
const spaces = /\s+/g;

/** The industry, place, size and company number as given, each checked against its column, or a sentence naming what does not fit. */
export function validateCompanyProfileFindings(input: Record<string, unknown>): ProfileFindings | string {
	const findings = {
		industry: trimmedText(input.industry),
		location: trimmedText(input.location),
		postcode: trimmedText(input.postcode),
		headcountBand: trimmedText(input.headcountBand),
		companyNumber: trimmedText(input.companyNumber)
	};
	const refusal = profileRefusal(findings);
	if (refusal !== null) return refusal;
	return { ...findings, postcode: postcodeIn(findings.postcode) };
}

function profileRefusal({ industry, location, postcode, headcountBand, companyNumber }: ProfileFindings): string | null {
	if (industry.length > longestIndustry) return `The industry is at most ${longestIndustry} characters.`;
	if (location.length > longestLocation) return `The location is at most ${longestLocation} characters.`;
	if (!isWholePostcodeOrBlank(postcode)) return `${postcode} is not a UK postcode, such as KT1 1AA.`;
	const bandRefusal = validateHeadcountBand(headcountBand);
	if (bandRefusal !== null) return bandRefusal;
	if (companyNumber === '') return null;
	return validateCompanyNumber(companyNumber);
}

function isWholePostcodeOrBlank(text: string): boolean {
	if (text === '') return true;
	const compactPostcode = postcodeIn(text).replace(spaces, '');
	return compactPostcode === text.replace(spaces, '').toUpperCase();
}
