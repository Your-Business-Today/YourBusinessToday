import { companyResearchLimits } from './companyResearchRules';
import { normaliseCompanyNumber, validateCompanyNumber } from './prospectRules';
import { trimmedText } from './trimmedText';

/** Which of a person's appointments to add as leads, and the parent to group them under. */
export type AppointmentChoice = { companyNumbers: string[]; groupName: string };

export const appointmentChoiceRefusals = {
	numbersRequired: 'Give companyNumbers as a list of at least one company number from read_person_appointments.',
	groupNameTooLong: `The groupName is at most ${companyResearchLimits.longestName} characters.`
} as const;

/** The choice as given, each number normalised and checked, or a sentence naming what does not fit. */
export function validateAppointmentChoice(input: Record<string, unknown>): AppointmentChoice | string {
	const { companyNumbers } = input;
	if (!Array.isArray(companyNumbers) || companyNumbers.length === 0) return appointmentChoiceRefusals.numbersRequired;
	const numbers = companyNumbers.map((number) => normaliseCompanyNumber(trimmedText(number)));
	const notANumber = numbers.map(validateCompanyNumber).find((refusal) => refusal !== null);
	if (notANumber !== undefined && notANumber !== null) return notANumber;
	const groupName = trimmedText(input.groupName);
	if (groupName.length > companyResearchLimits.longestName) return appointmentChoiceRefusals.groupNameTooLong;
	return { companyNumbers: [...new Set(numbers)], groupName };
}
