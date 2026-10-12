/** A company as Companies House names it, about to become a client row; an overseas registered office carries no UK postcode. */
export type ProspectSeed = { name: string; companyNumber: string; address: string; postcode?: string };

/** A Companies House company number: eight characters, letters or digits, such as 13752749 or SC123456. */
export const companyNumberLength = 8;
const companyNumberShape = /^[A-Z0-9]{8}$/i;

export const prospectNeedsNameAndNumber = 'A company name and number are required.';

/** Why the prospect cannot go on the register as it stands, or null when every value fits its column. */
export function validateProspect(seed: ProspectSeed): string | null {
	if (seed.name === '' || seed.companyNumber === '') return prospectNeedsNameAndNumber;
	if (!companyNumberShape.test(seed.companyNumber)) {
		return `${seed.companyNumber} is not a company number: Companies House numbers are ${companyNumberLength} letters or digits.`;
	}
	return null;
}
