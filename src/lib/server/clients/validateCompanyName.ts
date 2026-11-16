import { companyResearchLimits } from '$lib/data/companyResearchRules';
import { trimmedText } from '$lib/data/trimmedText';

const { longestName } = companyResearchLimits;

export const companyNameRefusals = {
	nameMissing: 'A company needs a name: the name cannot be empty.',
	nameTooLong: `The name is at most ${longestName} characters.`
} as const;

/** The company's name as sent, trimmed and checked against the limit it is held to on the register, or a sentence saying why it does not fit. */
export function validateCompanyName(value: unknown): { name: string } | string {
	const name = trimmedText(value);
	if (name === '') return companyNameRefusals.nameMissing;
	if (name.length > longestName) return companyNameRefusals.nameTooLong;
	return { name };
}
