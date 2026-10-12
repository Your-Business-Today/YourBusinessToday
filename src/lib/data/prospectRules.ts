import { postcodeIn } from './postcode';

/** A company as Companies House names it, about to become a client row. */
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
	const postcode = seed.postcode ?? '';
	if (postcode !== '' && postcodeIn(postcode) === '') return `${postcode} does not read as a postcode.`;
	return null;
}
