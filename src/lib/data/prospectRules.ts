/** A company as Companies House names it, about to become a client row; an overseas registered office carries no UK postcode. */
export type ProspectSeed = { name: string; companyNumber: string; address: string; postcode?: string };

/** A Companies House company number: eight characters, letters or digits, such as 13752749 or SC123456. */
export const companyNumberLength = 8;
const companyNumberShape = /^[A-Z0-9]{8}$/i;

const whitespace = /\s+/g;
const digitsOnly = /^\d+$/;

/** "SC 123456" and "1234567" as the register writes them: no spaces, upper case, digits padded to eight. */
export function normaliseCompanyNumber(text: string): string {
	const compact = text.replace(whitespace, '').toUpperCase();
	if (digitsOnly.test(compact)) return compact.padStart(companyNumberLength, '0');
	return compact;
}

export const prospectNeedsNameAndNumber = 'A company name and number are required.';

/** Why the text is not a company number, or null when it is one. */
export function validateCompanyNumber(companyNumber: string): string | null {
	if (companyNumberShape.test(companyNumber)) return null;
	return `${companyNumber} is not a company number: Companies House numbers are ${companyNumberLength} letters or digits.`;
}

/** Why the prospect cannot go on the register as it stands, or null when every value fits its column. */
export function validateProspect(seed: ProspectSeed): string | null {
	if (seed.name === '' || seed.companyNumber === '') return prospectNeedsNameAndNumber;
	const notANumber = validateCompanyNumber(seed.companyNumber);
	if (notANumber !== null) return notANumber;
	return null;
}
